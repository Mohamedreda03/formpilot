import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user is accessing /ws without an ID - let the page handle it
  if (pathname === "/ws" || pathname === "/ws/") {
    // Let the ws/page.tsx handle the logic
    return NextResponse.next();
  }

  // For all other workspace routes, continue normally
  return NextResponse.next();
}

export const config = {
  matcher: ["/ws", "/ws/(.*)"],
};
