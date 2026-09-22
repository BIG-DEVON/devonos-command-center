import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  birthdayCategoryForGroup,
  getHallOfFameMembers,
  hallMemberSelect,
  isHallMemberGroup,
  isHallMemberStatus,
  nextHallPhotoNumber,
  serializeHallMember,
} from "@/lib/hall-of-fame";
import { formText, readHallPortrait } from "@/lib/hall-of-fame-upload";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function uniqueConflict(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function GET() {
  try {
    const members = await getHallOfFameMembers();
    return NextResponse.json({ ok: true, members });
  } catch (error) {
    console.error("Failed to load Hall of Fame:", error);
    return NextResponse.json(
      { ok: false, message: "The Hall of Fame could not be loaded." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const name = formText(formData, "name");
    const designation = formText(formData, "designation");
    const organization = formText(formData, "organization");
    const group = formText(formData, "group", "State Revenue");
    const status = formText(formData, "status", "verified");
    const requestedNumber = Number(formText(formData, "photoNumber"));
    const photoNumber =
      Number.isInteger(requestedNumber) && requestedNumber > 0
        ? requestedNumber
        : await nextHallPhotoNumber();
    const portrait = await readHallPortrait(formData.get("photo"));

    if (name.length < 2 || name.length > 120) {
      return NextResponse.json(
        { ok: false, message: "Use a member name between 2 and 120 characters." },
        { status: 400 }
      );
    }
    if (designation.length > 140 || organization.length > 180) {
      return NextResponse.json(
        { ok: false, message: "Keep the designation and organisation concise." },
        { status: 400 }
      );
    }
    if (!isHallMemberGroup(group) || !isHallMemberStatus(status)) {
      return NextResponse.json(
        { ok: false, message: "Choose a valid group and verification status." },
        { status: 400 }
      );
    }

    const member = await prisma.hallOfFameMemberRecord.create({
      data: {
        id: randomUUID(),
        photoNumber,
        name,
        designation,
        organization,
        group,
        status,
        birthdayCategory: birthdayCategoryForGroup(group),
        photoData: portrait?.bytes,
        photoMimeType: portrait?.mimeType ?? "",
      },
      select: hallMemberSelect,
    });

    return NextResponse.json({
      ok: true,
      member: serializeHallMember(member),
      message: `${name} was added to the Hall of Fame.`,
    });
  } catch (error) {
    if (uniqueConflict(error)) {
      return NextResponse.json(
        { ok: false, message: "That portrait number is already in use." },
        { status: 409 }
      );
    }
    console.error("Failed to add Hall of Fame member:", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "The member could not be added.",
      },
      { status: 500 }
    );
  }
}
