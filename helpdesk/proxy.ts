import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { canAccessPath, getDefaultAppRoute, readSessionFromCookieString } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const session = readSessionFromCookieString(request.headers.get("cookie"));

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!canAccessPath(request.nextUrl.pathname, session.user.role)) {
    return NextResponse.redirect(new URL(getDefaultAppRoute(session.user.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
