import { NextResponse } from "next/server";
import { requestSendCode } from "@/lib/authCodeStore";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };

  const email = body.email?.trim().toLowerCase() ?? "";

  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "YOU-I <onboarding@resend.dev>";

  if (!apiKey) {
    return NextResponse.json(
      { error: "Email provider is not configured" },
      { status: 500 },
    );
  }

  const sendResult = requestSendCode(email);

  if (!sendResult.ok) {
    return NextResponse.json(
      {
        error:
          sendResult.reason === "cooldown"
            ? "Please wait before requesting another code."
            : "Too many code requests. Try again later.",
        retryAfterSeconds: sendResult.retryAfterSeconds,
      },
      { status: 429 },
    );
  }

  const code = String(sendResult.code ?? "");

  if (!code) {
    return NextResponse.json(
      { error: "Failed to generate verification code" },
      { status: 500 },
    );
  }

  const subject = `Your YOU-I sign-in code: ${code}`;
  const text = [
    "Hi,",
    "",
    `Your YOU-I verification code is ${code}.`,
    "",
    "Enter this code in the browser to create your account and sign in.",
    "",
    "For security, this code expires in 3 minutes.",
    "",
    "If you did not request this code, you can safely ignore this email.",
  ].join("\n");

  const html = `
    <div style="background:#f3f4f6;padding:32px 16px;">
      <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:18px;padding:24px 20px 20px 20px;border:1px solid #e5e7eb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;color:#111827;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
          <div style="width:28px;height:28px;border-radius:999px;background:#ef4444;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#ffffff;">
            UI
          </div>
          <div style="display:flex;flex-direction:column;">
            <span style="font-size:13px;font-weight:600;color:#111827;">YOU-I</span>
            <span style="font-size:11px;color:#6b7280;">Verification code</span>
          </div>
        </div>
        <h1 style="font-size:18px;line-height:1.4;font-weight:600;margin:0 0 8px 0;">Here is your 6-digit code</h1>
        <p style="font-size:13px;line-height:1.6;margin:0 0 18px 0;color:#4b5563;">
          Enter this code in your browser to create your YOU-I account and continue:
        </p>
        <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin:0 0 18px 0;">
          ${code
            .split("")
            .map(
              (digit) =>
                `<span style="width:40px;height:40px;border-radius:12px;border:1px solid #fecaca;background:#fef2f2;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:600;color:#b91c1c;">${digit}</span>`,
            )
            .join("")}
        </div>
        <p style="font-size:12px;line-height:1.6;margin:0 0 8px 0;color:#6b7280;">
          This code expires in <span style="font-weight:600;color:#111827;">3 minutes</span> and can only be used once.
        </p>
        <p style="font-size:12px;line-height:1.5;margin:0 0 14px 0;color:#9ca3af;">
          If you did not request this email, you can safely ignore it.
        </p>
        <p style="font-size:11px;line-height:1.5;margin:0;color:#9ca3af;">
          Sent securely from YOU-I. For best results, keep this code private and do not forward this email.
        </p>
      </div>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to send code" },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
