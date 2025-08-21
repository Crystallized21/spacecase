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
    message: 'Starting GET /api/bookings/commons request',
    level: 'info',
    data: {
      endpoint: '/api/bookings/commons',
      method: 'GET',
      timestamp: new Date().toISOString()
    }
  });

  try {
    const url = new URL(request.url);
    const subjectId = url.searchParams.get('subject');

    Sentry.addBreadcrumb({
      category: 'params',
      message: 'Extracted query parameters',
      level: 'info',
      data: {subjectId}
    });

    // If no subject ID provided, return empty array
    if (!subjectId) {
      Sentry.addBreadcrumb({
        category: 'validation',
        message: 'No subject ID provided, returning empty array',
        level: 'info'
      });
      return NextResponse.json([]);
    }

    Sentry.addBreadcrumb({
      category: 'database',
      message: 'Querying Supabase for commons linked to subject',
      level: 'info',
      data: {subjectId}
    });

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
      Sentry.addBreadcrumb({
        category: 'error',
        message: 'Supabase query error',
        level: 'error',
        data: {
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details
        }
      });

      Sentry.captureException(error, {
        extra: {
          context: "Database fetch operation",
          operation: "subject_common_access.select",
          subjectId,
          errorCode: error.code,
          errorDetails: error.details
        },
        tags: {
          source: "supabase",
          operation: "select"
        }
      });
      return NextResponse.json({error: "Internal Server Error"}, {status: 500});
    }

    Sentry.addBreadcrumb({
      category: 'data',
      message: 'Supabase query successful',
      level: 'info',
      data: {
        recordCount: data?.length || 0
      }
    });

    // Extract commons names
    // biome-ignore lint/suspicious/noExplicitAny: supabase returns really weird types
    const commons = data.map((item: any) => item.commons.name);

    Sentry.addBreadcrumb({
      category: 'api',
      message: 'Returning successful response',
      level: 'info',
      data: {
        commonsCount: commons.length
      }
    });

    return NextResponse.json(commons);
  } catch (err) {
    Sentry.addBreadcrumb({
      category: 'error',
      message: 'Unexpected error in commons API',
      level: 'error',
      data: {
        errorMessage: err instanceof Error ? err.message : String(err)
      }
    });

    Sentry.captureException(err, {
      extra: {
        endpoint: "/api/bookings/commons",
        method: "GET",
        timestamp: new Date().toISOString(),
        environmentInfo: {
          nodeEnv: process.env.NODE_ENV,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing"
        }
      },
      tags: {
        source: "api",
        handler: "GET_bookings_commons"
      }
    });
    return NextResponse.json({error: "Internal Server Error"}, {status: 500});
  }
}