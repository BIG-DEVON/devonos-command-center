import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Use the standard account sign-up flow." },
    { status: 410 }
  );
}
