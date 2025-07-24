import {createClient} from "@supabase/supabase-js";
import {NextResponse} from "next/server";
import * as Sentry from "@sentry/nextjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

type Slot = {
  id: number;
  slot_number: number;
  weekday: string;
  start_time: string;
  end_time: string;
};

export async function GET(request: Request) {
  try {
    const {searchParams} = new URL(request.url);
    const day = searchParams.get("day");

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

    // Format the data to match the expected structure
    const formattedSlots = data.map(slot => ({
      id: slot.id,
      number: slot.slot_number,
      day: slot.weekday,
      startTime: slot.start_time,
      endTime: slot.end_time
    }));

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