import {createClient} from "@supabase/supabase-js";
import {type NextRequest, NextResponse} from "next/server";
import * as Sentry from "@sentry/nextjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const subjectId = url.searchParams.get('subject');

    // If no subject ID provided, return empty array
    if (!subjectId) {
      return NextResponse.json([]);
    }

    // Query commons linked to the selected subject through join table
    const {data, error} = await supabase
      .from("subject_common_access")
      .select(`
        commons:common_id (
          name
        )
      `)
      .eq("subject_id", subjectId);

    if (error) {
      Sentry.captureException(error, {
        extra: {
          context: "Database fetch operation",
          operation: "subject_common_access.select",
          subjectId
        }
      });
      return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }

    // Extract commons names
    // biome-ignore lint/suspicious/noExplicitAny: supabase returns really weird types
    const commons = data.map((item: any) => item.commons.name);

    return NextResponse.json(commons);
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