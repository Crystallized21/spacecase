import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import * as Sentry from "@sentry/nextjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET() {
  // add breadcrumb to mark request start
  Sentry.addBreadcrumb({
    category: 'api',
    message: 'Starting GET /api/bookings/view request',
    level: 'info',
    data: {
      endpoint: '/api/bookings/view',
      method: 'GET',
      timestamp: new Date().toISOString()
    }
  });

  try {
    // add breadcrumb for database query attempt
    Sentry.addBreadcrumb({
      category: 'database',
      message: 'Querying Supabase for bookings data',
      level: 'info'
    });

    const {data, error} = await supabase
      .from("bookings")
      .select(`
        id,
        date,
        period,
        justification,
        user_id,
        room_id,
        subject_id,
        users (
          name,
          email
        ),
        rooms (
          name,
          common_id,
          commons:commons (
            name
          )
        ),
        subjects (
          code,
          name
        )
      `);

    if (error) {
      // add detailed error information
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
          context: "bookings.select",
          errorCode: error.code,
          errorDetails: error.details,
          errorMessage: error.message,
          query: "bookings.select with joins"
        },
        tags: {
          source: "supabase",
          operation: "select"
        }
      });

      return NextResponse.json({error: "Database query failed"}, {status: 500});
    }

    // add breadcrumb for query results
    Sentry.addBreadcrumb({
      category: 'data',
      message: 'Supabase query successful',
      level: 'info',
      data: {
        recordCount: data?.length || 0
      }
    });

    if (!data || data.length === 0) {
      Sentry.addBreadcrumb({
        category: 'data',
        message: 'No booking records found',
        level: 'info'
      });
    }

    // add breadcrumb for data mapping
    Sentry.addBreadcrumb({
      category: 'processing',
      message: 'Mapping database records to frontend model',
      level: 'info'
    });

    // map data to frontend shape
    // biome-ignore lint/suspicious/noExplicitAny: we need to handle dynamic data structure
    const bookings = (data || []).map((b: any) => {
      return {
        id: b.id,
        teacherName: b.users?.name || "",
        teacherEmail: b.users?.email || "",
        date: b.date,
        time: b.period,
        notes: b.justification,
        room: b.rooms?.[0]?.name || "",
        commons: b.rooms?.[0]?.commons?.[0]?.name || "",
        subject: b.subjects?.[0]?.name || "",
        subjectCode: b.subjects?.[0]?.code || "",
      };
    });

    // add breadcrumb for successful response
    Sentry.addBreadcrumb({
      category: 'api',
      message: 'Returning successful response',
      level: 'info',
      data: {
        bookingCount: bookings.length
      }
    });

    return NextResponse.json(bookings);
  } catch (err) {
    // add breadcrumb for unexpected error
    Sentry.addBreadcrumb({
      category: 'error',
      message: 'Unexpected error in bookings API',
      level: 'error',
      data: {
        errorMessage: err instanceof Error ? err.message : String(err)
      }
    });

    // capture detailed error information
    Sentry.captureException(err, {
      extra: {
        endpoint: "/api/bookings/view",
        method: "GET",
        timestamp: new Date().toISOString(),
        environmentInfo: {
          nodeEnv: process.env.NODE_ENV,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing"
        }
      },
      tags: {
        source: "api",
        handler: "GET_bookings_view"
      }
    });

    return NextResponse.json({error: "Internal Server Error"}, {status: 500});
  }
}