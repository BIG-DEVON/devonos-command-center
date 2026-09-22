import "server-only";
import { prisma } from "@/lib/prisma";
import { normalizeMorrowEmail } from "@/lib/morrow-session";

type AccountIdentity = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

function identityDisplayName(identity: AccountIdentity) {
  const metadata = identity.user_metadata ?? {};
  const candidate =
    metadata.display_name ?? metadata.full_name ?? metadata.name ?? "";
  return typeof candidate === "string" ? candidate.trim().slice(0, 80) : "";
}

export function morrowAuthCallbackUrl(request: Request, next: string) {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const callback = new URL(
    "/auth/confirm",
    configuredSiteUrl || new URL(request.url).origin
  );
  callback.searchParams.set("next", next);
  return callback.toString();
}

export async function ensureMorrowAccount(
  identity: AccountIdentity,
  options: { displayName?: string; requestAccess?: boolean } = {}
) {
  const email = normalizeMorrowEmail(identity.email ?? "");
  if (!email) throw new Error("The authenticated account has no email address.");

  const [byIdentity, byEmail] = await Promise.all([
    prisma.morrowUser.findUnique({ where: { supabaseUserId: identity.id } }),
    prisma.morrowUser.findUnique({ where: { email } }),
  ]);
  if (byIdentity && byEmail && byIdentity.id !== byEmail.id) {
    throw new Error("This email is linked to a different Morrow account.");
  }

  const existing = byIdentity ?? byEmail;
  if (existing?.supabaseUserId && existing.supabaseUserId !== identity.id) {
    throw new Error("This email is linked to a different identity.");
  }

  const requestedName =
    options.displayName?.trim().slice(0, 80) ||
    identityDisplayName(identity) ||
    email.split("@")[0];
  const account = existing
    ? await prisma.morrowUser.update({
        where: { id: existing.id },
        data: {
          supabaseUserId: identity.id,
          passwordHash: null,
          displayName: existing.displayName || requestedName,
        },
      })
    : await prisma.morrowUser.create({
        data: {
          id: crypto.randomUUID(),
          supabaseUserId: identity.id,
          email,
          displayName: requestedName,
          passwordHash: null,
          role: "MEMBER",
          status: "PENDING",
        },
      });

  if (options.requestAccess && account.status === "PENDING") {
    const activatedOwner = await prisma.$transaction(
      async (transaction) => {
        const activeOwner = await transaction.morrowUser.findFirst({
          where: { role: "OWNER", status: "ACTIVE" },
          select: { id: true },
        });
        if (activeOwner) return null;

        const activated = await transaction.morrowUser.update({
          where: { id: account.id },
          data: { role: "OWNER", status: "ACTIVE" },
        });
        await transaction.morrowAccessRequest.updateMany({
          where: { email, status: "PENDING" },
          data: {
            status: "APPROVED",
            reviewedAt: new Date(),
            reviewedById: account.id,
          },
        });
        return activated;
      },
      { isolationLevel: "Serializable" }
    );
    if (activatedOwner) return activatedOwner;

    const pendingRequest = await prisma.morrowAccessRequest.findFirst({
      where: { email, status: "PENDING" },
      select: { id: true },
    });
    if (pendingRequest) return account;

    await prisma.morrowAccessRequest.create({
      data: {
        email,
        displayName: account.displayName,
        phone: account.phone,
        requestedRole: account.role,
        reason: "Account created and email verified.",
      },
    });
  }

  return account;
}
