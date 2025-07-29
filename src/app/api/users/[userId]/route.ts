import {type NextRequest, NextResponse} from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  // extract userId from the URL
  const userId = request.nextUrl.pathname.split("/").pop();

  Sentry.addBreadcrumb({
    category: 'api',
    message: `Starting GET /api/users/${userId} request`,
    level: 'info',
    data: {
      endpoint: `/api/users/${userId}`,
      method: 'GET'
    }
  });

  try {
    Sentry.addBreadcrumb({
      category: 'external-api',
      message: 'Querying Clerk API for user data',
      level: 'info',
      data: {userId}
    });

    const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      Sentry.addBreadcrumb({
        category: 'error',
        message: 'Clerk API returned an error response',
        level: 'error',
        data: {
          status: response.status,
          statusText: response.statusText
        }
      });

      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    const userData = await response.json();

    Sentry.addBreadcrumb({
      category: 'data',
      message: 'Clerk API query successful',
      level: 'info'
    });

    return NextResponse.json({
      id: userData.id,
      firstName: userData.first_name,
      lastName: userData.last_name,
      imageUrl: userData.image_url,
      email: userData.email_addresses?.[0]?.email_address || "",
    });
  } catch (error) {
    console.error("Error fetching user:", error);

    Sentry.captureException(error, {
      extra: {
        endpoint: `/api/users/${userId}`,
        method: "GET",
        userId,
        errorMessage: error instanceof Error ? error.message : String(error)
      },
      tags: {
        source: "api",
        operation: "clerk.users.get"
      }
    });

    return NextResponse.json(
      {error: "Failed to fetch user"},
      {status: 500}
    );
  }
}