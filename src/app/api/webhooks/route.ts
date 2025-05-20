import {verifyWebhook} from "@clerk/nextjs/webhooks";
import type {NextRequest} from "next/server";
import * as Sentry from "@sentry/nextjs";
import {createClient} from "@supabase/supabase-js";

// Define the expected User type
interface User {
  id: string;
  first_name: string;
  last_name: string;
  email_addresses: { email_address: string }[];
}

// Get Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  Sentry.captureException(new Error("Missing Supabase environment variables"));
  throw new Error("Missing Supabase environment variables");
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Extracts the user's email address, returns null if not found
function getUserEmail(user: User): string | null {
  return Array.isArray(user.email_addresses) && user.email_addresses[0]?.email_address
    ? user.email_addresses[0].email_address.toLowerCase()
    : null;
}

function isTeacher(email: string): boolean {
  return !email.startsWith("st") && email.endsWith("@ormiston.school.nz");
}

function isDev(email: string): boolean {
  return email.startsWith("st23030");
}

// Inserts a new user into the Supabase "users" table
async function insertUser(user: User, email: string) {
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
    console.log(error);
    // Handle duplicate user error
    if (error.code === "23505") {
      console.log(`⚠️ User ${email} already exists in Supabase.`);
    }
  } else {
    console.log(`✅ Added ${isDev(email) ? "dev" : "teacher"} ${user.first_name} ${user.last_name} ${email} to Supabase.`);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify the webhook event
    const evt = await verifyWebhook(req);
    if (evt.type !== "user.created") return new Response("Webhook received", {status: 200});

    const user = evt.data as User;
    const email = getUserEmail(user);

    if (!email || !("first_name" in user) || !("last_name" in user)) {
      return new Response("Webhook received", {status: 200});
    }

    // Insert user if teacher or dev
    if (isTeacher(email) || isDev(email)) {
      await insertUser(user, email);
    } else {
      console.log("🚫 Not a teacher, skipping Supabase insert.");
    }

    return new Response("Webhook received", {status: 200});
  } catch (err) {
    Sentry.captureException(err);
    console.error("❌ Error verifying webhook:", err);
    return new Response("Error verifying webhook", {status: 400});
  }
}