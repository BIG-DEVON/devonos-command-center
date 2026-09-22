import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  birthdayDateKey,
  buildBirthdayMessage,
  formatBirthdayDate,
  type BirthdayTone,
} from "@/lib/birthday-content";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const profile = await prisma.birthdayProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      return NextResponse.json(
        { ok: false, message: "Birthday profile not found." },
        { status: 404 }
      );
    }

    const scheduledDate = birthdayDateKey(profile.month, profile.day);
    const title = `Birthday Draft - ${profile.name} - ${scheduledDate}`;
    const existing = await prisma.socialDraft.findFirst({
      where: { title },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        created: false,
        draft: existing,
        href: "/social",
        message: "The Social Studio draft is already prepared.",
      });
    }

    const draft = await prisma.socialDraft.create({
      data: {
        title,
        campaign: "Birthday Command Center",
        platform: "Instagram",
        status: "Draft",
        scheduledDate,
        caption: buildBirthdayMessage({
          name: profile.name,
          role: profile.role,
          preferredTone: profile.preferredTone as BirthdayTone,
        }),
        visualDirection: [
          `Create a refined birthday tribute for ${profile.name}.`,
          profile.role ? `Designation: ${profile.role}.` : "",
          profile.photoUrl
            ? `Use the approved portrait reference: ${profile.photoUrl}.`
            : "Leave a considered portrait area until an approved image is supplied.",
          "Keep the design editorial, dignified, spacious, and unmistakably human.",
          "Use a deep ink, warm ivory, and restrained gold visual system. Avoid generic AI imagery, confetti overload, neon gradients, and template-like effects.",
        ]
          .filter(Boolean)
          .join("\n"),
        hashtags: "#Birthday #Leadership #JointRevenueBoard",
        notes: [
          `Prepared from Birthday Command Center for ${formatBirthdayDate(
            profile.month,
            profile.day
          )}.`,
          profile.notes ? `Profile context: ${profile.notes}` : "",
          "Review names, designation, date, and portrait before publishing.",
        ]
          .filter(Boolean)
          .join("\n"),
      },
    });

    return NextResponse.json({
      ok: true,
      created: true,
      draft,
      href: "/social",
      message: "Social Studio draft prepared and ready for review.",
    });
  } catch (error) {
    console.error("Failed to prepare birthday draft:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "The birthday draft could not be prepared.",
      },
      { status: 500 }
    );
  }
}
