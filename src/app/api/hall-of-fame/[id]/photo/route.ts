import { NextResponse } from "next/server";
import {
  hallMemberSelect,
  serializeHallMember,
  syncHallMemberBirthday,
} from "@/lib/hall-of-fame";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const member = await prisma.hallOfFameMemberRecord.findUnique({
    where: { id },
    select: {
      photoData: true,
      photoMimeType: true,
      photoUrl: true,
    },
  });

  if (!member) {
    return new Response("Portrait not found.", { status: 404 });
  }
  if (!member.photoData || !member.photoMimeType) {
    if (member.photoUrl) {
      return NextResponse.redirect(new URL(member.photoUrl, request.url));
    }
    return new Response("Portrait not available.", { status: 404 });
  }

  return new Response(member.photoData, {
    headers: {
      "Content-Type": member.photoMimeType,
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const current = await prisma.hallOfFameMemberRecord.findUnique({
      where: { id },
      select: hallMemberSelect,
    });
    if (!current) {
      return NextResponse.json(
        { ok: false, message: "Hall of Fame member not found." },
        { status: 404 }
      );
    }

    const member = await prisma.hallOfFameMemberRecord.update({
      where: { id },
      data: {
        photoData: null,
        photoMimeType: "",
        photoUrl: "",
      },
      select: hallMemberSelect,
    });
    await syncHallMemberBirthday(member, current.name, {
      photoChanged: true,
    });

    return NextResponse.json({
      ok: true,
      member: serializeHallMember(member),
      message: `The portrait for ${member.name} was removed.`,
    });
  } catch (error) {
    console.error("Failed to remove Hall of Fame portrait:", error);
    return NextResponse.json(
      { ok: false, message: "The portrait could not be removed." },
      { status: 500 }
    );
  }
}
