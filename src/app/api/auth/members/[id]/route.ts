import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMorrowSession } from "@/lib/morrow-session";
import { isMorrowRole } from "@/lib/morrow-permissions";

const MEMBER_STATUSES = ["ACTIVE", "SUSPENDED"] as const;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentMorrowSession();
  if (!session) {
    return NextResponse.json(
      { ok: false, message: "Sign in to manage members." },
      { status: 401 }
    );
  }
  if (session.role !== "OWNER") {
    return NextResponse.json(
      { ok: false, message: "Only the workspace owner can change member access." },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;
    if (id === session.userId) {
      return NextResponse.json(
        { ok: false, message: "You cannot change your own access here." },
        { status: 400 }
      );
    }

    const body = (await request.json()) as { role?: unknown; status?: unknown };
    const role = body.role === undefined ? undefined : String(body.role).toUpperCase();
    const status =
      body.status === undefined ? undefined : String(body.status).toUpperCase();

    if (role !== undefined && !isMorrowRole(role)) {
      return NextResponse.json(
        { ok: false, message: "Choose a valid workspace role." },
        { status: 400 }
      );
    }
    if (
      status !== undefined &&
      !MEMBER_STATUSES.includes(status as (typeof MEMBER_STATUSES)[number])
    ) {
      return NextResponse.json(
        { ok: false, message: "Choose active or suspended access." },
        { status: 400 }
      );
    }
    if (role === undefined && status === undefined) {
      return NextResponse.json(
        { ok: false, message: "No member change was supplied." },
        { status: 400 }
      );
    }

    const target = await prisma.morrowUser.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json(
        { ok: false, message: "That member no longer exists." },
        { status: 404 }
      );
    }

    if (target.role === "OWNER" && (role !== undefined || status === "SUSPENDED")) {
      return NextResponse.json(
        { ok: false, message: "Transfer ownership before changing another owner." },
        { status: 409 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const user = await tx.morrowUser.update({
        where: { id },
        data: {
          ...(role ? { role } : {}),
          ...(status ? { status } : {}),
        },
        select: {
          id: true,
          displayName: true,
          email: true,
          role: true,
          status: true,
        },
      });

      if (status === "SUSPENDED") {
        await tx.morrowAuthSession.deleteMany({ where: { userId: id } });
      }

      return user;
    });

    return NextResponse.json({
      ok: true,
      user: updated,
      message:
        status === "SUSPENDED"
          ? "Member access suspended and active sessions revoked."
          : status === "ACTIVE"
            ? "Member access restored."
            : "Member role updated.",
    });
  } catch (error) {
    console.error("Failed to update Morrow member:", error);
    return NextResponse.json(
      { ok: false, message: "Morrow could not update that member." },
      { status: 500 }
    );
  }
}
