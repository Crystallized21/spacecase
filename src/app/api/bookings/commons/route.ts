import {createClient} from "@supabase/supabase-js";
import {NextResponse} from "next/server";
import * as Sentry from "@sentry/nextjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET() {
  try {
    const {data, error} = await supabase.from("commons").select("name");
    if (error) {
      Sentry.captureException(error, {
        extra: {
          context: "Database fetch operation",
          operation: "commons.select"
        }
      });
      return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }
    return NextResponse.json(data.map((c: { name: string }) => c.name));
  } catch (err) {
    Sentry.captureException(err, {
      extra: {
        endpoint: "/api/bookings/commons",
        method: "GET"
      }
    });
    return NextResponse.json({error: "Internal Server Error"}, {status: 500});
  }
}