import {createClient} from "@supabase/supabase-js";
import {type NextRequest, NextResponse} from "next/server";
import * as Sentry from "@sentry/nextjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(request: NextRequest) {
  Sentry.addBreadcrumb({
    category: 'api',
    message: 'Starting GET /api/bookings/rooms request',
    level: 'info',
    data: {
      endpoint: '/api/bookings/rooms',
      method: 'GET',
      timestamp: new Date().toISOString()
    }
  });

  try {
    const {searchParams} = new URL(request.url);
    const common = searchParams.get("common");
    const rawDate = searchParams.get("date");
    const slot = searchParams.get("slot");

    Sentry.addBreadcrumb({
      category: 'params',
      message: 'Extracted query parameters',
      level: 'info',
      data: {common, rawDate, slot}
    });

    if (!common) {
      Sentry.addBreadcrumb({
        category: 'validation',
        message: 'Missing common parameter',
        level: 'warning'
      });
      return NextResponse.json({error: "Missing common"}, {status: 400});
    }

    // Normalize date to yyyy-MM-dd if provided
    const date = rawDate ? (rawDate.length > 10 ? rawDate.slice(0, 10) : rawDate) : null;

    Sentry.addBreadcrumb({
      category: 'database',
      message: 'Looking up common in database',
      level: 'info',
      data: {commonName: common}
    });

    const {data: commons, error: commonError} = await supabase
      .from("commons")
      .select("id")
      .eq("name", common)
      .single();

    if (commonError || !commons) {
      Sentry.addBreadcrumb({
        category: 'error',
        message: 'Common not found in database',
        level: 'error',
        data: {
          errorCode: commonError?.code,
          errorMessage: commonError?.message,
          commonName: common
        }
      });

      Sentry.captureException(commonError || new Error("Common not found"), {
        extra: {
          context: "Database fetch operation",
          operation: "commons.select",
          commonName: common,
          errorCode: commonError?.code,
          errorDetails: commonError?.details
        },
        tags: {
          source: "supabase",
          operation: "select"
        }
      });
      return NextResponse.json({error: "Common not found"}, {status: 404});
    }

    Sentry.addBreadcrumb({
      category: 'database',
      message: 'Querying bookable rooms for common',
      level: 'info',
      data: {commonId: commons.id}
    });

    // Get all rooms for the common
    const {data: rooms, error: roomsError} = await supabase
      .from("rooms")
      .select("id, name")
      .eq("common_id", commons.id)
      .eq("is_bookable", true);

    if (roomsError) {
      Sentry.addBreadcrumb({
        category: 'error',
        message: 'Failed to fetch rooms',
        level: 'error',
        data: {
          errorCode: roomsError.code,
          errorMessage: roomsError.message,
          commonId: commons.id
        }
      });

      Sentry.captureException(roomsError, {
        extra: {
          context: "Database fetch operation",
          operation: "rooms.select",
          commonId: commons.id,
          errorCode: roomsError.code,
          errorDetails: roomsError.details
        },
        tags: {
          source: "supabase",
          operation: "select"
        }
      });
      return NextResponse.json({error: "Failed to fetch rooms"}, {status: 500});
    }

    Sentry.addBreadcrumb({
      category: 'data',
      message: 'Rooms query successful',
      level: 'info',
      data: {
        roomCount: rooms?.length || 0,
        commonId: commons.id
      }
    });

    // if date and slot are provided, check which rooms are already booked
    let bookedRoomIds: string[] = [];
    if (date && slot) {
      Sentry.addBreadcrumb({
        category: 'database',
        message: 'Checking for room bookings',
        level: 'info',
        data: {date, slot, commonId: commons.id}
      });

      const {data: bookings, error: bookingsError} = await supabase
        .from("bookings")
        .select("room_id")
        .eq("date", date)
        .eq("period", Number(slot));

      if (bookingsError) {
        Sentry.addBreadcrumb({
          category: 'error',
          message: 'Error checking room bookings',
          level: 'warning',
          data: {
            errorCode: bookingsError.code,
            errorMessage: bookingsError.message
          }
        });

        Sentry.captureException(bookingsError, {
          extra: {
            context: "Checking room availability",
            operation: "bookings.select",
            date,
            slot
          },
          tags: {
            source: "supabase",
            operation: "select"
          }
        });
      } else if (bookings) {
        bookedRoomIds = bookings.map(booking => booking.room_id);

        Sentry.addBreadcrumb({
          category: 'data',
          message: 'Bookings check successful',
          level: 'info',
          data: {
            bookedRoomsCount: bookedRoomIds.length,
            date,
            slot
          }
        });
      }
    }

    Sentry.addBreadcrumb({
      category: 'processing',
      message: 'Preparing room availability response',
      level: 'info',
      data: {
        totalRooms: rooms?.length || 0,
        bookedRooms: bookedRoomIds.length
      }
    });

    // format response with availability information
    const roomsWithAvailability = (rooms || []).map(room => ({
      name: room.name,
      isBooked: bookedRoomIds.includes(room.id)
    }));

    roomsWithAvailability.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: "base"})
    );

    Sentry.addBreadcrumb({
      category: 'api',
      message: 'Returning successful response',
      level: 'info',
      data: {
        roomCount: roomsWithAvailability.length,
        availableRooms: roomsWithAvailability.filter(r => !r.isBooked).length,
        bookedRooms: roomsWithAvailability.filter(r => r.isBooked).length
      }
    });

    return NextResponse.json(roomsWithAvailability);
  } catch (err) {
    Sentry.addBreadcrumb({
      category: 'error',
      message: 'Unexpected error in rooms API',
      level: 'error',
      data: {
        errorMessage: err instanceof Error ? err.message : String(err)
      }
    });

    Sentry.captureException(err, {
      extra: {
        endpoint: "/api/bookings/rooms",
        method: "GET",
        timestamp: new Date().toISOString(),
        environmentInfo: {
          nodeEnv: process.env.NODE_ENV,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing"
        }
      },
      tags: {
        source: "api",
        handler: "GET_bookings_rooms"
      }
    });
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}