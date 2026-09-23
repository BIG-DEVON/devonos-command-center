import { NextRequest, NextResponse } from "next/server";
import {
  MORROW_SESSION_COOKIE,
  readMorrowSession,
} from "@/lib/morrow-session";
import { refreshMorrowSupabaseSession } from "@/lib/supabase/proxy";
import {
  canCreateWorkspaceContent,
  canManageAccess,
  canManageWorkspace,
} from "@/lib/morrow-permissions";

const PERSONAL_MUTATION_ROUTES = [
  "/api/notifications",
  "/api/push-subscriptions",
  "/api/notification-delivery/test",
];

const WORKSPACE_ADMIN_MUTATION_ROUTES = [
  "/api/settings",
  "/api/automations",
  "/api/alerts/scan",
  "/api/auth/members",
];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

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

  if (session) {
    const pathname = request.nextUrl.pathname;
    const mutation = !["GET", "HEAD", "OPTIONS"].includes(request.method);

    if (pathname.startsWith("/settings/security") && !canManageAccess(session.role)) {
      return NextResponse.redirect(new URL("/settings", request.url));
    }

    if (mutation && pathname.startsWith("/api/")) {
      const personalMutation = startsWithAny(pathname, PERSONAL_MUTATION_ROUTES);
      const adminMutation = startsWithAny(
        pathname,
        WORKSPACE_ADMIN_MUTATION_ROUTES
      );
      const permitted = personalMutation
        ? true
        : adminMutation
          ? canManageWorkspace(session.role)
          : canCreateWorkspaceContent(session.role);

      if (!permitted) {
        return NextResponse.json(
          {
            ok: false,
            message: "Your account has read-only access to this workspace.",
          },
          { status: 403 }
        );
      }
    }

    return response;
  }

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
