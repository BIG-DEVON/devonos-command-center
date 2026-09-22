import { NextResponse } from "next/server";
import {
  birthdayCategoryForGroup,
  detachHallMemberBirthday,
  hallMemberSelect,
  isHallMemberGroup,
  isHallMemberStatus,
  serializeHallMember,
  syncHallMemberBirthday,
} from "@/lib/hall-of-fame";
import { formText, readHallPortrait } from "@/lib/hall-of-fame-upload";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function uniqueConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function PATCH(request: Request, context: RouteContext) {
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

    const formData = await request.formData();
    const name = formText(formData, "name", current.name);
    const designation = formText(
      formData,
      "designation",
      current.designation
    );
    const organization = formText(
      formData,
      "organization",
      current.organization
    );
    const group = formText(formData, "group", current.group);
    const status = formText(formData, "status", current.status);
    const requestedNumber = Number(
      formText(formData, "photoNumber", String(current.photoNumber))
    );
    const portrait = await readHallPortrait(formData.get("photo"));

    if (name.length < 2 || name.length > 120) {
      return NextResponse.json(
        { ok: false, message: "Use a member name between 2 and 120 characters." },
        { status: 400 }
      );
    }
    if (
      !Number.isInteger(requestedNumber) ||
      requestedNumber < 1 ||
      !isHallMemberGroup(group) ||
      !isHallMemberStatus(status)
    ) {
      return NextResponse.json(
        { ok: false, message: "Check the portrait number, group, and status." },
        { status: 400 }
      );
    }

    const member = await prisma.hallOfFameMemberRecord.update({
      where: { id },
      data: {
        photoNumber: requestedNumber,
        name,
        designation,
        organization,
        group,
        status,
        birthdayCategory: birthdayCategoryForGroup(group),
        photoData: portrait?.bytes,
        photoMimeType: portrait?.mimeType,
        photoUrl: portrait ? "" : undefined,
      },
      select: hallMemberSelect,
    });
    await syncHallMemberBirthday(member, current.name, {
      photoChanged: Boolean(portrait),
    });

    return NextResponse.json({
      ok: true,
      member: serializeHallMember(member),
      message: `${name} was updated.`,
    });
  } catch (error) {
    if (uniqueConflict(error)) {
      return NextResponse.json(
        { ok: false, message: "That portrait number is already in use." },
        { status: 409 }
      );
    }
    console.error("Failed to update Hall of Fame member:", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "The member could not be updated.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const current = await prisma.hallOfFameMemberRecord.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!current) {
      return NextResponse.json(
        { ok: false, message: "Hall of Fame member not found." },
        { status: 404 }
      );
    }

    await detachHallMemberBirthday(current.id, current.name);
    await prisma.hallOfFameMemberRecord.delete({ where: { id } });
    return NextResponse.json({
      ok: true,
      message: `${current.name} was removed from the Hall of Fame.`,
    });
  } catch (error) {
    console.error("Failed to remove Hall of Fame member:", error);
    return NextResponse.json(
      { ok: false, message: "The member could not be removed." },
      { status: 500 }
    );
  }
}
