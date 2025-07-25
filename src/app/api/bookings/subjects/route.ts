import {createClient} from "@supabase/supabase-js";
import {auth, currentUser} from "@clerk/nextjs/server";
import {type NextRequest, NextResponse} from "next/server";
import * as Sentry from "@sentry/nextjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(req: NextRequest) {
  try {
    const {userId} = await auth();
    const user = await currentUser();

    if (!userId) {
      Sentry.captureMessage("Unauthorized access attempt — no Clerk userId", "warning");
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    Sentry.setUser({
      id: userId,
      username: `${user?.firstName} ${user?.lastName}`,
      email: user?.emailAddresses[0]?.emailAddress || "No email",
    });

    // 🔍 lookup user in supabase using Clerk user_id (text)
    const {data: userData, error: userError} = await supabase
      .from("users")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (userError) {
      Sentry.captureException(userError);
      return NextResponse.json({error: "User lookup failed"}, {status: 500});
    }

    if (!userData) {
      Sentry.captureMessage(`User not found in Supabase for Clerk ID: ${userId}`, "warning");
      return NextResponse.json({error: "User not found"}, {status: 404});
    }

    const teacherUUID = userData.id;
    Sentry.setContext("booking_subjects", {teacherUUID});

    const {data: subjects, error: subjectError} = await supabase
      .from("subject_teachers")
      .select("subject_id, line_number, subjects(id, code, name)")
      // i hate this, use Clerk user_id directly
      .eq("teacher_id", userId);

    if (subjectError) {
      Sentry.captureException(subjectError);
      return NextResponse.json(
        {error: "Failed to fetch subjects"},
        {status: 500}
      );
    }

    // biome-ignore lint/suspicious/noExplicitAny: supabase dynamic type is hard to type correctly
    const simplifiedSubjects = (subjects ?? []).map((s: any) => ({
      id: s.subject_id,
      name: `${s.subjects?.name ?? ""} (Line ${s.line_number})`,
      code: s.subjects?.code ?? "",
      line: s.line_number,
    }));

    return NextResponse.json(simplifiedSubjects);
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      {error: "Internal server error"},
      {status: 500}
    );
  }
}
