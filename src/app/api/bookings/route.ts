import {createClient} from "@supabase/supabase-js";
import {type NextRequest, NextResponse} from "next/server";
import * as Sentry from "@sentry/nextjs";
import {currentUser} from "@clerk/nextjs/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: NextRequest) {
  Sentry.addBreadcrumb({
    category: "api",
    message: "POST /api/bookings called",
    level: "info",
    data: {url: request.url}
  });

  try {
    const user = await currentUser();

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
