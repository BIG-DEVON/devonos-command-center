import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMorrowSession } from "@/lib/morrow-session";
import { createMorrowSupabaseAdminClient } from "@/lib/supabase/admin";
import { isMorrowRole } from "@/lib/morrow-permissions";

function canReview(role: string) {
  return role === "OWNER" || role === "ADMIN";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentMorrowSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Sign in to review access requests." },
      { status: 401 }
    );
  }
  if (!canReview(session.role)) {
    return NextResponse.json(
      { ok: false, message: "Owner or Admin access is required." },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const action = String(body.action ?? "").toLowerCase();
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { ok: false, message: "Choose approve or reject." },
        { status: 400 }
      );
    }

    const accessRequest = await prisma.morrowAccessRequest.findUnique({
      where: { id },
    });
    if (!accessRequest || accessRequest.status !== "PENDING") {
      return NextResponse.json(
        { ok: false, message: "That pending request no longer exists." },
        { status: 404 }
      );
    }
    const requestedRole = String(
      body.role ?? accessRequest.requestedRole ?? "MEMBER"
    ).toUpperCase();
    if (
      !isMorrowRole(requestedRole) ||
      (session.role !== "OWNER" && ["OWNER", "ADMIN"].includes(requestedRole))
    ) {
      return NextResponse.json(
        { ok: false, message: "Choose an allowed role for this member." },
        { status: 400 }
      );
    }
    const user = await prisma.morrowUser.findUnique({
      where: { email: accessRequest.email },
    });
    if (!user?.supabaseUserId) {
      return NextResponse.json(
        {
          ok: false,
          message: "This person must create an account and verify their email first.",
        },
        { status: 409 }
      );
    }
    if (user.status === "ACTIVE") {
      return NextResponse.json(
        { ok: false, message: "This account is already active." },
        { status: 409 }
      );
    }

    if (action === "approve") {
      const admin = createMorrowSupabaseAdminClient();
      const { data, error } = await admin.auth.admin.getUserById(
        user.supabaseUserId
      );
      if (error || !data.user?.email_confirmed_at) {
        return NextResponse.json(
          {
            ok: false,
            message: "This person must verify their email before approval.",
          },
          { status: 409 }
        );
      }
    }

    await prisma.$transaction([
      prisma.morrowUser.update({
        where: { id: user.id },
        data: {
          role: requestedRole,
          status: action === "approve" ? "ACTIVE" : "REJECTED",
          failedLoginCount: 0,
          lockedUntil: null,
        },
      }),
      prisma.morrowAccessRequest.update({
        where: { id },
        data: {
          status: action === "approve" ? "APPROVED" : "REJECTED",
          reviewedAt: new Date(),
          reviewedById: session.userId,
        },
      }),
      prisma.morrowAuthSession.deleteMany({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      ok: true,
      message:
        action === "approve"
          ? "Account approved. The member can now sign in."
          : "Account request declined.",
    });
  } catch (error) {
    console.error("Failed to review Morrow access:", error);
    return NextResponse.json(
      { ok: false, message: "Morrow could not complete that review." },
      { status: 500 }
    );
  }
}
