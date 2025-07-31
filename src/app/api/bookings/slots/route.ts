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
    const day = searchParams.get("day");
    const room = searchParams.get("room");
    const date = searchParams.get("date");

    // Get all slots for the given day
    let query = supabase
      .from("slot_times")
      .select("id, slot_number, weekday, start_time, end_time");

    if (day) {
      query = query.eq("weekday", day);
    }

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

    // Check which slots are already booked if room and date are provided
    let bookedSlots: number[] = [];
    if (room && date) {
      // Get room ID first
      const {data: roomData, error: roomError} = await supabase
        .from("rooms")
        .select("id")
        .eq("name", room)
        .single();

      // In src/app/api/bookings/slots/route.ts, update the booking detection code:
      if (roomData) {
        const formattedDate = new Date(date).toISOString().split('T')[0];

        const {data: bookings, error: bookingError} = await supabase
          .from("bookings")
          .select("id, period")
          .eq("room_id", roomData.id)
          .eq("date", formattedDate);

        console.log(`Checking bookings for room ${roomData.id} (${room}) on ${formattedDate}:`);
        console.log("Bookings found:", bookings);

        if (bookingError) {
          console.error("Error fetching bookings:", bookingError);
          Sentry.captureException(bookingError);
        } else if (bookings && bookings.length > 0) {
          bookedSlots = bookings.map(booking => Number(booking.period));
          console.log("Slot numbers that are booked (as numbers):", bookedSlots);
        }
      }
    }

    // Format the data and include booking status
    const formattedSlots = data.map(slot => {
      const isSlotBooked = bookedSlots.includes(slot.slot_number);
      console.log(`Slot ${slot.slot_number} booked status: ${isSlotBooked}`);

      return {
        id: slot.id,
        number: slot.slot_number,
        day: slot.weekday,
        startTime: slot.start_time,
        endTime: slot.end_time,
        isBooked: isSlotBooked
      };
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