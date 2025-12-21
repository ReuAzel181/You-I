import { NextResponse } from "next/server";
import { verifyCode } from "@/lib/authCodeStore";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; code?: string };

  const email = body.email?.trim().toLowerCase() ?? "";
  const code = body.code?.trim() ?? "";

  if (!email || !code) {
    return NextResponse.json({ error: "Missing email or code" }, { status: 400 });
  }

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
  }

  const result = verifyCode(email, code);

  if (!result.ok) {
    if (result.reason === "expired") {
      return NextResponse.json(
        { error: "Code has expired. Request a new one." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Incorrect code. Check the digits and try again." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
