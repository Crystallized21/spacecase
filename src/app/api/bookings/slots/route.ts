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
    const subjectId = searchParams.get("subject"); // New parameter
    const lineNumber = searchParams.get("line"); // New parameter for explicit line selection

    if (!day) {
      return NextResponse.json(
        {error: "Day parameter is required"},
        {status: 400}
      );
    }

    // Get teacher ID for filtering by subject line
    const {userId} = await auth();

    // Find available slot numbers for this teacher's line(s)
    let slotNumbers: number[] = [];

    if (subjectId && userId) {
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
        Sentry.captureException(lineError);
        return NextResponse.json(
          {error: "Failed to fetch teacher's lines"},
          {status: 500}
        );
      }

      if (!lines || lines.length === 0) {
        return NextResponse.json([]);
      }

      const teacherLines = lines.map(l => l.line_number);

      // Get slot numbers for these lines on this day
      const {data: lineSlots, error: lineSlotsError} = await supabase
        .from("line_slots")
        .select("slot_number")
        .in("line_number", teacherLines)
        .eq("weekday", day);

      if (lineSlotsError) {
        Sentry.captureException(lineSlotsError);
        return NextResponse.json(
          {error: "Failed to fetch line slots"},
          {status: 500}
        );
      }

      slotNumbers = lineSlots.map(ls => ls.slot_number);

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