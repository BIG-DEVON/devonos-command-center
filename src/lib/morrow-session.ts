import {
  createHash,
  randomBytes,
} from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const MORROW_SESSION_COOKIE = "morrow_session";

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const SESSION_TOUCH_INTERVAL_MS = 5 * 60 * 1000;

export type MorrowSession = {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  onboardingCompletedAt: Date | null;
  userAgent: string;
  createdAt: Date;
  lastSeenAt: Date;
  expiresAt: Date;
};

function sessionTokenHash(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

function normalizeUserAgent(value: string | null) {
  return (value ?? "Unknown device").replace(/\s+/g, " ").trim().slice(0, 240);
}

function toSession(
  session: {
    id: string;
    userId: string;
    userAgent: string;
    createdAt: Date;
    lastSeenAt: Date;
    expiresAt: Date;
    user: {
      email: string;
      displayName: string;
      role: string;
      status: string;
      onboardingCompletedAt: Date | null;
    };
  }
): MorrowSession {
  return {
    id: session.id,
    userId: session.userId,
    email: session.user.email,
    displayName: session.user.displayName,
    role: session.user.role,
    status: session.user.status,
    onboardingCompletedAt: session.user.onboardingCompletedAt,
    userAgent: session.userAgent,
    createdAt: session.createdAt,
    lastSeenAt: session.lastSeenAt,
    expiresAt: session.expiresAt,
  };
}

export function normalizeMorrowEmail(value: string) {
  return value.trim().toLowerCase();
}

export function passwordValidationMessage(password: string) {
  if (password.length < 12) return "Use at least 12 characters.";
  if (password.length > 128) return "Use no more than 128 characters.";
  if (!/[a-z]/.test(password)) return "Add a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Add an uppercase letter.";
  if (!/[0-9]/.test(password)) return "Add a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Add a symbol.";
  return "";
}

export async function createMorrowSession(
  userId: string,
  request: Request
) {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const expiresAt = new Date(
    now.getTime() + SESSION_MAX_AGE_SECONDS * 1000
  );

  await prisma.morrowAuthSession.deleteMany({
    where: { expiresAt: { lte: now } },
  });

  const session = await prisma.morrowAuthSession.create({
    data: {
      userId,
      tokenHash: sessionTokenHash(token),
      userAgent: normalizeUserAgent(request.headers.get("user-agent")),
      expiresAt,
    },
  });

  const olderSessions = await prisma.morrowAuthSession.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: 8,
    select: { id: true },
  });
  if (olderSessions.length > 0) {
    await prisma.morrowAuthSession.deleteMany({
      where: { id: { in: olderSessions.map(({ id }) => id) } },
    });
  }

  return { token, session };
}

export async function readMorrowSession(
  token: string | undefined,
  options: { touch?: boolean } = {}
) {
  if (!token || token.length < 32 || token.length > 160) return null;

  const session = await prisma.morrowAuthSession.findUnique({
    where: { tokenHash: sessionTokenHash(token) },
    include: {
      user: {
        select: {
          email: true,
          displayName: true,
          role: true,
          status: true,
          onboardingCompletedAt: true,
        },
      },
    },
  });

  if (!session) return null;
  if (session.user.status !== "ACTIVE") {
    await prisma.morrowAuthSession.delete({ where: { id: session.id } });
    return null;
  }
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.morrowAuthSession.delete({ where: { id: session.id } });
    return null;
  }

  if (
    options.touch !== false &&
    Date.now() - session.lastSeenAt.getTime() > SESSION_TOUCH_INTERVAL_MS
  ) {
    const lastSeenAt = new Date();
    await prisma.morrowAuthSession.update({
      where: { id: session.id },
      data: { lastSeenAt },
    });
    session.lastSeenAt = lastSeenAt;
  }

  return toSession(session);
}

export async function getCurrentMorrowSession(
  options: { touch?: boolean } = {}
) {
  const cookieStore = await cookies();
  return readMorrowSession(
    cookieStore.get(MORROW_SESSION_COOKIE)?.value,
    options
  );
}

export async function setMorrowSessionCookie(
  token: string,
  request: Request
) {
  const cookieStore = await cookies();
  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const isSecureRequest =
    forwardedProtocol === "https" || new URL(request.url).protocol === "https:";

  cookieStore.set(MORROW_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isSecureRequest,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    priority: "high",
  });
}

export async function clearMorrowSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(MORROW_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
    priority: "high",
  });
}

export async function revokeCurrentMorrowSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(MORROW_SESSION_COOKIE)?.value;
  if (token) {
    await prisma.morrowAuthSession.deleteMany({
      where: { tokenHash: sessionTokenHash(token) },
    });
  }
  await clearMorrowSessionCookie();
}

export function tokenHashForSessionLookup(token: string) {
  return sessionTokenHash(token);
}
