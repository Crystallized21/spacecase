import {createClient} from "@supabase/supabase-js";
import {type NextRequest, NextResponse} from "next/server";
import * as Sentry from "@sentry/nextjs";
import {auth, currentUser} from "@clerk/nextjs/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// TODO: reduce complexity of this function, mainly because of sentry logging maybe?
export async function POST(request: NextRequest) {
  Sentry.addBreadcrumb({
    category: "api",
    message: "POST /api/bookings called",
    level: "info",
    data: {url: request.url}
  });

  try {
    const {userId} = await auth();
    const user = await currentUser();

    Sentry.setUser({
      id: userId || undefined,
      username: `${user?.firstName} ${user?.lastName}`,
      email: user?.emailAddresses[0]?.emailAddress || "No email",
    });

    if (!user) {
      Sentry.addBreadcrumb({
        category: "auth",
        message: "User not authenticated",
        level: "warning"
      });
      return NextResponse.json(
        {error: "Not authenticated"},
        {status: 401}
      );
    }

    Sentry.setUser({id: user.id, email: user.emailAddresses?.[0]?.emailAddress});

    const userName = `${user.firstName} ${user.lastName}`.trim();

    Sentry.addBreadcrumb({
      category: "db",
      message: "Looking up user in Supabase",
      level: "info",
      data: {userName}
    });

    const {data: userData, error: userError} = await supabase
      .from("users")
      .select("user_id")
      .eq("name", userName)
      .single();

    if (userError || !userData) {
      Sentry.addBreadcrumb({
        category: "db",
        message: "User not found in database",
        level: "warning"
      });
      return NextResponse.json(
        {error: "User not found in database"},
        {status: 404}
      );
    }

    const body = await request.json();
    const {subject, room, common, date, slot, justification} = body;

    if (!subject || !room || !date || !slot) {
      Sentry.addBreadcrumb({
        category: "validation",
        message: "Missing required fields",
        level: "warning"
      });
      return NextResponse.json(
        {error: "Missing required fields"},
        {status: 400}
      );
    }

    // look up common_id from the common name
    // First get the common_id
    const {data: commonData, error: commonError} = await supabase
      .from("commons")
      .select("id")
      .eq("name", common)
      .single();

    if (commonError || !commonData) {
      return NextResponse.json(
        {error: "Common not found in database"},
        {status: 404}
      );
    }

    // then look up the room_id from the room name
    const {data: roomData, error: roomError} = await supabase
      .from("rooms")
      .select("id")
      .eq("name", room)
      .eq("common_id", commonData.id)
      .single();
    console.log("Room lookup result:", roomData, roomError);

    if (roomError || !roomData) {
      Sentry.addBreadcrumb({
        category: "db",
        message: "Room not found in database",
        level: "warning"
      });
      return NextResponse.json(
        {error: "Room not found in database"},
        {status: 404}
      );
    }

    Sentry.addBreadcrumb({
      category: "db",
      message: "Inserting booking",
      level: "info",
      data: {user_id: userData.user_id, date, slot}
    });

    const {data, error} = await supabase
      .from("bookings")
      .insert({
        user_id: userData.user_id,
        room_id: roomData.id,
        date: new Date(date).toISOString().split('T')[0],
        period: Number(slot),
        subject_id: subject,
        justification: justification || null
      })
      .select();

    if (error) {
      console.error("Supabase insert error:", error, {
        user_id: userData.user_id,
        date,
        slot,
        justification
      });
      Sentry.captureException(error, {
        extra: {
          context: "Database insert operation",
          operation: "bookings.insert",
          payload: body,
          user: user,
          userData: userData
        }
      });
      return NextResponse.json(
        {error: "Failed to create booking", details: error.message},
        {status: 500}
      );
    }

    return NextResponse.json({
      message: "Booking created successfully",
      booking: data[0]
    }, {status: 201});

  } catch (error) {
    console.error("POST /api/bookings 500 error:", error);
    Sentry.captureException(error, {
      extra: {
        endpoint: "/api/bookings",
        method: "POST",
        requestBody: await request.text()
      }
    });
    return NextResponse.json(
      {error: "Internal server error", details: error instanceof Error ? error.message : String(error)},
      {status: 500}
    );
  }
}

export async function GET() {
  // add breadcrumb to mark request start
  Sentry.addBreadcrumb({
    category: 'api',
    message: 'Starting GET /api/bookings request',
    level: 'info',
    data: {
      endpoint: '/api/bookings',
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
        created_at,
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
        room: b.rooms?.name || "",
        commons: b.rooms?.commons?.name || "",
        subject: b.subjects?.name || "",
        subjectCode: b.subjects?.code || "",
        createdAt: b.created_at,
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
        endpoint: "/api/bookings",
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
