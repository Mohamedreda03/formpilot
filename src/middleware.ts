import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is accessing /workspace without an ID
  if (pathname === "/workspace") {
    // Redirect to workspace selection page
    return NextResponse.redirect(new URL("/workspace/select", request.url));
  }

  // Handle /workspace/ with trailing slash
  if (pathname === "/workspace/") {
    return NextResponse.redirect(new URL("/workspace/select", request.url));
  }

  // For all workspace routes, we'll rely on client-side auth check
  // since middleware doesn't have easy access to Appwrite session
  return NextResponse.next();
}

export const config = {
  matcher: ["/workspace", "/workspace/(.*)"],
};
