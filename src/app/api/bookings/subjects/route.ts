import {createClient} from "@supabase/supabase-js";
import {auth, currentUser} from "@clerk/nextjs/server";
import {type NextRequest, NextResponse} from "next/server";
import * as Sentry from "@sentry/nextjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(request: NextRequest) {
  Sentry.addBreadcrumb({
    category: 'api',
    message: 'Starting GET /api/bookings/subjects request',
    level: 'info',
    data: {
      endpoint: '/api/bookings/subjects',
      method: 'GET',
      timestamp: new Date().toISOString()
    }
  });

  try {
    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'Authenticating user with Clerk',
      level: 'info'
    });

    const {userId} = await auth();
    const user = await currentUser();

    if (!userId) {
      Sentry.addBreadcrumb({
        category: 'auth',
        message: 'Authentication failed - no Clerk userId',
        level: 'warning'
      });

      Sentry.captureMessage("Unauthorized access attempt — no Clerk userId", "warning");
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    Sentry.setUser({
      id: userId,
      username: `${user?.firstName} ${user?.lastName}`,
      email: user?.emailAddresses[0]?.emailAddress || "No email",
    });

    Sentry.addBreadcrumb({
      category: 'auth',
      message: 'User authenticated successfully',
      level: 'info',
      data: {
        userId,
        username: `${user?.firstName} ${user?.lastName}`
      }
    });

    // 🔍 lookup user in supabase using Clerk user_id (text)
    Sentry.addBreadcrumb({
      category: 'database',
      message: 'Looking up user in Supabase',
      level: 'info',
      data: {clerkUserId: userId}
    });

    const {data: userData, error: userError} = await supabase
      .from("users")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (userError) {
      Sentry.addBreadcrumb({
        category: 'error',
        message: 'Supabase user lookup error',
        level: 'error',
        data: {
          errorCode: userError.code,
          errorMessage: userError.message,
          errorDetails: userError.details
        }
      });

      Sentry.captureException(userError, {
        extra: {
          context: "User lookup operation",
          operation: "users.select",
          clerkUserId: userId,
          errorCode: userError.code,
          errorDetails: userError.details
        },
        tags: {
          source: "supabase",
          operation: "select"
        }
      });
      return NextResponse.json({error: "User lookup failed"}, {status: 500});
    }

    if (!userData) {
      Sentry.addBreadcrumb({
        category: 'validation',
        message: 'User not found in Supabase',
        level: 'warning',
        data: {clerkUserId: userId}
      });

      Sentry.captureMessage(`User not found in Supabase for Clerk ID: ${userId}`, "warning");
      return NextResponse.json({error: "User not found"}, {status: 404});
    }

    const teacherUUID = userData.id;
    Sentry.setContext("booking_subjects", {teacherUUID});

    Sentry.addBreadcrumb({
      category: 'database',
      message: 'Querying for teacher subjects',
      level: 'info',
      data: {teacherId: userId}
    });

    const {data: subjects, error: subjectError} = await supabase
      .from("subject_teachers")
      .select("subject_id, line_number, subjects(id, code, name)")
      // i hate this, use Clerk user_id directly
      .eq("teacher_id", userId);

    if (subjectError) {
      Sentry.addBreadcrumb({
        category: 'error',
        message: 'Failed to fetch subjects',
        level: 'error',
        data: {
          errorCode: subjectError.code,
          errorMessage: subjectError.message,
          errorDetails: subjectError.details,
          teacherId: userId
        }
      });

      Sentry.captureException(subjectError, {
        extra: {
          context: "Database fetch operation",
          operation: "subject_teachers.select",
          teacherId: userId,
          errorCode: subjectError.code,
          errorDetails: subjectError.details
        },
        tags: {
          source: "supabase",
          operation: "select"
        }
      });
      return NextResponse.json(
        {error: "Failed to fetch subjects"},
        {status: 500}
      );
    }

    Sentry.addBreadcrumb({
      category: 'data',
      message: 'Subjects query successful',
      level: 'info',
      data: {
        subjectCount: subjects?.length || 0,
        teacherId: userId
      }
    });

    // biome-ignore lint/suspicious/noExplicitAny: supabase dynamic type is hard to type correctly
    const simplifiedSubjects = (subjects ?? []).map((s: any) => ({
      id: s.subject_id,
      name: `${s.subjects?.name ?? ""} (Line ${s.line_number})`,
      code: s.subjects?.code ?? "",
      line: s.line_number,
    }));

    Sentry.addBreadcrumb({
      category: 'processing',
      message: 'Processed subject data for response',
      level: 'info',
      data: {
        simplifiedSubjectCount: simplifiedSubjects.length
      }
    });

    Sentry.addBreadcrumb({
      category: 'api',
      message: 'Returning successful response',
      level: 'info',
      data: {
        subjectCount: simplifiedSubjects.length
      }
    });

    return NextResponse.json(simplifiedSubjects);
  } catch (error) {
    Sentry.addBreadcrumb({
      category: 'error',
      message: 'Unexpected error in subjects API',
      level: 'error',
      data: {
        errorMessage: error instanceof Error ? error.message : String(error)
      }
    });

    Sentry.captureException(error, {
      extra: {
        endpoint: "/api/bookings/subjects",
        method: "GET",
        timestamp: new Date().toISOString(),
        environmentInfo: {
          nodeEnv: process.env.NODE_ENV,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "configured" : "missing"
        }
      },
      tags: {
        source: "api",
        handler: "GET_bookings_subjects"
      }
    });
    return NextResponse.json(
      {error: "Internal server error"},
      {status: 500}
    );
  }
}