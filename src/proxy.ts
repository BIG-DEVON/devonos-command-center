import { NextRequest, NextResponse } from "next/server";
import {
  MORROW_SESSION_COOKIE,
  readMorrowSession,
} from "@/lib/morrow-session";
import { refreshMorrowSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const refreshed = await refreshMorrowSupabaseSession(request);
  const response = refreshed.response;
  if (!refreshed.authenticated) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json(
        { ok: false, message: "Your session has expired. Sign in again." },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    if (returnTo !== "/") loginUrl.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(loginUrl);
  }

  const token = request.cookies.get(MORROW_SESSION_COOKIE)?.value;
  const session = await readMorrowSession(token, { touch: false });

  if (session) return response;

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { ok: false, message: "Your Morrow session has expired. Sign in again." },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/login", request.url);
  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (returnTo !== "/") loginUrl.searchParams.set("returnTo", returnTo);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!api/auth|api/health/db|api/automations/daily-intelligence|api/automations/notification-delivery|auth/confirm|login|birthday/|_next/static|_next/image|favicon.ico|og-morrow.png|morrow-sw.js|morrow-mark.svg|manifest.webmanifest|members/|buki/).*)",
  ],
};
