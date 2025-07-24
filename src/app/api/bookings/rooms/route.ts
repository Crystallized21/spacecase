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
    if (!common) {
      return NextResponse.json({error: "Missing common"}, {status: 400});
    }

    // get common id
    const {data: commons, error: commonError} = await supabase
      .from("commons")
      .select("id")
      .eq("name", common)
      .single();

    if (commonError || !commons) {
      Sentry.captureException(commonError || "Common not found");
      return NextResponse.json({error: "Common not found"}, {status: 404});
    }

    // get rooms for common
    const {data: rooms, error: roomsError} = await supabase
      .from("rooms")
      .select("name")
      .eq("common_id", commons.id)
      .eq("is_bookable", true);

    if (roomsError) {
      Sentry.captureException(roomsError);
      return NextResponse.json({error: "Failed to fetch rooms"}, {status: 500});
    }

    // Sort room names naturally (numbers and names)
    const sortedRooms = (rooms ?? [])
      .map((r: { name: string }) => r.name)
      .sort((a: string, b: string) => a.localeCompare(b, undefined, {numeric: true, sensitivity: "base"}));

    return NextResponse.json(sortedRooms);
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({error: "Internal server error"}, {status: 500});
  }
}