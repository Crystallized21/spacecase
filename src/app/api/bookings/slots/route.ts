import {createClient} from "@supabase/supabase-js";
import {auth} from "@clerk/nextjs/server";
import {type NextRequest, NextResponse} from "next/server";
import * as Sentry from "@sentry/nextjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url);
    const day = searchParams.get("day");
    const room = searchParams.get("room");
    const date = searchParams.get("date");
    const subjectId = searchParams.get("subject");
    const lineNumber = searchParams.get("line");

    Sentry.addBreadcrumb({
      category: 'api',
      message: 'Slots API called',
      level: 'info',
      data: {
        day,
        room,
        date,
        subjectId,
        lineNumber
      }
    });

    if (!day) {
      Sentry.addBreadcrumb({
        category: 'validation',
        message: 'Missing day parameter',
        level: 'warning'
      });
      return NextResponse.json(
        {error: "Day parameter is required"},
        {status: 400}
      );
    }

    // Get teacher ID for filtering by subject line
    const {userId} = await auth();

    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'Auth check completed',
      level: 'info',
      data: {
        userId: userId || 'not authenticated'
      }
    });

    // Find available slot numbers for this teacher's line(s)
    let slotNumbers: number[] = [];

    if (subjectId && userId) {
      Sentry.addBreadcrumb({
        category: 'query',
        message: 'Filtering slots by subject and teacher',
        level: 'info',
        data: {
          subjectId,
          lineNumber: lineNumber || 'any'
        }
      });

      // Find line numbers for this teacher and subject
      let lineQuery = supabase
        .from("subject_teachers")
        .select("line_number")
        .eq("teacher_id", userId)
        .eq("subject_id", subjectId);

      // If line number is explicitly provided, verify it belongs to this teacher
      if (lineNumber) {
        lineQuery = lineQuery.eq("line_number", lineNumber);
      }

      const {data: lines, error: lineError} = await lineQuery;

      if (lineError) {
        Sentry.captureException(lineError, {
          extra: {
            context: "Fetching teacher's lines",
            subjectId,
            lineNumber
          }
        });
        return NextResponse.json(
          {error: "Failed to fetch teacher's lines"},
          {status: 500}
        );
      }

      if (!lines || lines.length === 0) {
        Sentry.addBreadcrumb({
          category: 'query',
          message: 'No lines found for teacher and subject',
          level: 'info',
          data: {
            subjectId,
            lineNumber: lineNumber || 'any'
          }
        });
        return NextResponse.json([]);
      }

      const teacherLines = lines.map(l => l.line_number);

      Sentry.addBreadcrumb({
        category: 'query',
        message: 'Found teacher lines',
        level: 'info',
        data: {
          teacherLines
        }
      });

      // Get slot numbers for these lines on this day
      const {data: lineSlots, error: lineSlotsError} = await supabase
        .from("line_slots")
        .select("slot_number")
        .in("line_number", teacherLines)
        .eq("weekday", day);

      if (lineSlotsError) {
        Sentry.captureException(lineSlotsError, {
          extra: {
            context: "Fetching line slots",
            day,
            teacherLines
          }
        });
        return NextResponse.json(
          {error: "Failed to fetch line slots"},
          {status: 500}
        );
      }

      slotNumbers = lineSlots.map(ls => ls.slot_number);

      Sentry.addBreadcrumb({
        category: 'query',
        message: 'Found slots for teacher lines',
        level: 'info',
        data: {
          slotNumbers
        }
      });

      // If no slots found for this line on this day
      if (slotNumbers.length === 0) {
        return NextResponse.json([]);
      }
    }

    // Get slot times data
    let query = supabase
      .from("slot_times")
      .select("id, slot_number, weekday, start_time, end_time")
      .eq("weekday", day);

    // If filtering by subject/line, only include the slots for those lines
    if (subjectId && slotNumbers.length > 0) {
      query = query.in("slot_number", slotNumbers);
    }

    Sentry.addBreadcrumb({
      category: 'query',
      message: 'Fetching slot times',
      level: 'info',
      data: {
        day,
        filteredBySlots: subjectId && slotNumbers.length > 0
      }
    });

    const {data, error} = await query.order("slot_number");

    if (error) {
      Sentry.captureException(error, {
        extra: {
          context: "Fetching slots from database",
          day: day
        }
      });

      return NextResponse.json(
        {error: "Failed to fetch slots", details: error.message},
        {status: 500}
      );
    }

    Sentry.addBreadcrumb({
      category: 'query',
      message: 'Retrieved slot times',
      level: 'info',
      data: {
        slotCount: data.length
      }
    });

    // Check which slots are already booked
    let bookedSlots: number[] = [];

    if (date) {
      const formattedDate = new Date(date).toISOString().split('T')[0];

      Sentry.addBreadcrumb({
        category: 'query',
        message: 'Checking booked slots',
        level: 'info',
        data: {
          date: formattedDate,
          room: room || 'any'
        }
      });

      if (room) {
        // Check bookings for specific room
        const {data: roomData, error: roomError} = await supabase
          .from("rooms")
          .select("id")
          .eq("name", room)
          .single();

        if (roomError) {
          Sentry.addBreadcrumb({
            category: 'error',
            message: 'Room lookup failed',
            level: 'warning',
            data: {
              room,
              error: roomError.message
            }
          });
        }

        if (roomData) {
          const {data: bookings, error: bookingError} = await supabase
            .from("bookings")
            .select("id, period")
            .eq("room_id", roomData.id)
            .eq("date", formattedDate);

          if (bookingError) {
            Sentry.captureException(bookingError, {
              extra: {
                context: "Fetching room bookings",
                roomId: roomData.id,
                date: formattedDate
              }
            });
          }

          Sentry.addBreadcrumb({
            category: 'query',
            message: 'Found room bookings',
            level: 'info',
            data: {
              roomId: roomData.id,
              date: formattedDate,
              bookingsCount: bookings?.length || 0
            }
          });

          if (!bookingError && bookings && bookings.length > 0) {
            bookedSlots = bookings.map(booking => Number(booking.period));
          }
        }
      } else {
        // If no specific room, check ALL bookings for this date
        const {data: bookings, error: bookingError} = await supabase
          .from("bookings")
          .select("id, period")
          .eq("date", formattedDate);

        if (bookingError) {
          Sentry.captureException(bookingError, {
            extra: {
              context: "Fetching all bookings for date",
              date: formattedDate
            }
          });
        }

        Sentry.addBreadcrumb({
          category: 'query',
          message: 'Found all bookings for date',
          level: 'info',
          data: {
            date: formattedDate,
            bookingsCount: bookings?.length || 0
          }
        });

        if (!bookingError && bookings && bookings.length > 0) {
          // Get unique booked periods
          bookedSlots = [...new Set(bookings.map(booking => Number(booking.period)))];
        }
      }
    }

    // Format the data and include booking status
    const formattedSlots = data.map(slot => {
      const isSlotBooked = bookedSlots.includes(slot.slot_number);

      return {
        id: slot.id,
        number: slot.slot_number,
        day: slot.weekday,
        startTime: slot.start_time,
        endTime: slot.end_time,
        isBooked: isSlotBooked
      };
    });

    Sentry.addBreadcrumb({
      category: 'response',
      message: 'Returning formatted slots',
      level: 'info',
      data: {
        slotCount: formattedSlots.length,
        bookedSlotCount: formattedSlots.filter(s => s.isBooked).length
      }
    });

    return NextResponse.json(formattedSlots);
  } catch (error) {
    console.error("GET /api/bookings/slots error:", error);
    Sentry.captureException(error, {
      extra: {
        endpoint: "/api/bookings/slots",
        method: "GET"
      }
    });

    return NextResponse.json(
      {error: "Internal server error", details: error instanceof Error ? error.message : String(error)},
      {status: 500}
    );
  }
}