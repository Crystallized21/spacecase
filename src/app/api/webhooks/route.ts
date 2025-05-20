import {verifyWebhook} from "@clerk/nextjs/webhooks";
import {NextRequest} from "next/server";
import * as Sentry from "@sentry/nextjs";
import {createClient} from "@supabase/supabase-js";

// Setup Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const eventType = evt.type;
    const user = evt.data;

    if (
      eventType === "user.created" &&
      "email_addresses" in user &&
      Array.isArray(user.email_addresses) &&
      user.email_addresses[0]?.email_address &&
      "first_name" in user &&
      "last_name" in user
    ) {
      // Check if the user is a teacher or dev
      const email = user.email_addresses[0].email_address.toLowerCase();
      const isDev = email.startsWith("st23030");
      const isTeacher = !email.startsWith("st") && email.endsWith("@ormiston.school.nz");

      // If the user is a teacher or dev, insert them into Supabase
      if (isTeacher || isDev) {
        const {error} = await supabase.from("users").insert([
          {
            user_id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email,
            created_at: new Date().toISOString(),
            role: "teacher",
          },
        ]);

        if (error) {
          Sentry.captureException(error);
          console.log(error)
        }

        console.log(`✅ Added ${isDev ? "dev" : "teacher"} ${email} to Supabase.`);
      } else {
        console.log("🚫 Not a teacher, skipping Supabase insert.");
      }
    }

    return new Response("Webhook received", {status: 200});
  } catch (err) {
    Sentry.captureException(err);
    console.error("❌ Error verifying webhook:", err);
    return new Response("Error verifying webhook", {status: 400});
  }
}