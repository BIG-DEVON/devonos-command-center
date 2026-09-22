import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Open the secure link sent to your email." },
    { status: 410 }
  );
}
