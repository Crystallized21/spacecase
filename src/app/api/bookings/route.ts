import {createClient} from "@supabase/supabase-js";
import {type NextRequest, NextResponse} from "next/server";
import * as Sentry from "@sentry/nextjs";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    // Extract booking data
    const {subject, room, date, slot, justification} = body;

    // Validate required fields
    if (!subject || !room || !date || !slot) {
      return NextResponse.json(
        {error: "Missing required fields"},
        {status: 400}
      );
    }

    // Insert into Supabase
    const {data, error} = await supabase
      .from("bookings")
      .insert({
        user_id: request.headers.get("user-id") || body.user_id,
        date: new Date(date).toISOString().split('T')[0], // Format as YYYY-MM-DD
        period: slot,
        justification: justification || null
      })
      .select();

    if (error) {
      console.error("Database error:", error);
      Sentry.captureException(error, {
        extra: {
          context: "Database insert operation",
          operation: "bookings.insert",
          payload: body
        }
      });
      return NextResponse.json(
        {error: "Failed to create booking"},
        {status: 500}
      );
    }

    return NextResponse.json({
      message: "Booking created successfully",
      booking: data[0]
    }, {status: 201});

  } catch (error) {
    console.error("Server error:", error);
    Sentry.captureException(error, {
      extra: {
        endpoint: "/api/bookings",
        method: "POST"
      }
    });
    return NextResponse.json(
      {error: "Internal server error"},
      {status: 500}
    );
  }
}

// Add GET handler to fetch bookings
export async function GET(request: NextRequest) {
  try {
    const {searchParams} = new URL(request.url);
    const userId = searchParams.get('userId');

    let query = supabase.from("bookings").select(`
                *,
                users(name, email),
                rooms(name, type)
              `);

    // Apply filters if provided
    if (userId) query = query.eq('user_id', userId);

    // Execute query
    const {data, error} = await query.order('date', {ascending: false});

    if (error) {
      console.error("Database error:", error);
      Sentry.captureException(error, {
        extra: {
          context: "Database fetch operation",
          operation: "bookings.select",
          filters: {userId}
        }
      });
      return NextResponse.json(
        {error: "Failed to fetch bookings"},
        {status: 500}
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Server error:", error);
    Sentry.captureException(error, {
      extra: {
        endpoint: "/api/bookings",
        method: "GET",
        params: Object.fromEntries(new URL(request.url).searchParams)
      }
    });
    return NextResponse.json(
      {error: "Internal server error"},
      {status: 500}
    );
  }
}