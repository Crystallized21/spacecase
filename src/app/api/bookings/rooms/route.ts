import {createClient} from "@supabase/supabase-js";
import {type NextRequest, NextResponse} from "next/server";
import * as Sentry from "@sentry/nextjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url);
    const common = searchParams.get("common");
    const rawDate = searchParams.get("date");
    const slot = searchParams.get("slot");

    if (!common) {
      return NextResponse.json({error: "Missing common"}, {status: 400});
    }

    // Normalize date to yyyy-MM-dd if provided
    const date = rawDate ? (rawDate.length > 10 ? rawDate.slice(0, 10) : rawDate) : null;

    const {data: commons, error: commonError} = await supabase
      .from("commons")
      .select("id")
      .eq("name", common)
      .single();

    if (commonError || !commons) {
      Sentry.captureException(commonError || "Common not found");
      return NextResponse.json({error: "Common not found"}, {status: 404});
    }

    // Get all rooms for the common
    const {data: rooms, error: roomsError} = await supabase
      .from("rooms")
      .select("id, name")
      .eq("common_id", commons.id)
      .eq("is_bookable", true);

    if (roomsError) {
      Sentry.captureException(roomsError);
      return NextResponse.json({error: "Failed to fetch rooms"}, {status: 500});
    }

    // if date and slot are provided, check which rooms are already booked
    let bookedRoomIds: string[] = [];
    if (date && slot) {
      const {data: bookings, error: bookingsError} = await supabase
        .from("bookings")
        .select("room_id")
        .eq("date", date)
        .eq("period", Number(slot));

      if (!bookingsError && bookings) {
        bookedRoomIds = bookings.map(booking => booking.room_id);
      }
    }

    // format response with availability information
    const roomsWithAvailability = (rooms || []).map(room => ({
      name: room.name,
      isBooked: bookedRoomIds.includes(room.id)
    }));

    roomsWithAvailability.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: "base"})
    );

    return NextResponse.json(roomsWithAvailability);
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}