type AuthDeliveryResult = {
  ok: boolean;
  providerReference?: string;
  message?: string;
};

type AuthPurpose = "INVITE" | "PASSWORD_RESET";

function missing(...values: Array<string | undefined>) {
  return values.some((value) => !value?.trim());
}

export function getMorrowAuthProviderStatus() {
  return {
    email: !missing(process.env.RESEND_API_KEY, process.env.MORROW_EMAIL_FROM),
    sms: !missing(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
      process.env.TWILIO_VERIFY_SERVICE_SID
    ),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendMorrowEmailCode({
  email,
  displayName,
  code,
  purpose,
}: {
  email: string;
  displayName: string;
  code: string;
  purpose: AuthPurpose;
}): Promise<AuthDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.MORROW_EMAIL_FROM?.trim();
  if (!apiKey || !from) {
    return { ok: false, message: "Email delivery is not connected yet." };
  }

  const invitation = purpose === "INVITE";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: invitation
        ? "Your Morrow workspace invitation"
        : "Your Morrow password reset code",
      html: `
        <div style="background:#09090d;padding:40px 20px;font-family:Inter,ui-sans-serif,system-ui;color:#17171b">
          <div style="max-width:560px;margin:0 auto;background:#f7f6f1;border-radius:30px;padding:38px">
            <div style="font-size:12px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#6d5dfc">Morrow identity</div>
            <h1 style="margin:20px 0 10px;font-size:34px;line-height:1.05;letter-spacing:-.04em">${
              invitation ? "Your access is approved." : "Reset your password."
            }</h1>
            <p style="color:#667085;line-height:1.7">Hello ${escapeHtml(displayName)}, use this one-time code to ${
              invitation ? "activate your account" : "set a new password"
            }. It expires in 15 minutes.</p>
            <div style="margin:28px 0;background:#17171b;color:white;border-radius:20px;padding:24px;text-align:center;font-size:34px;font-weight:800;letter-spacing:.28em">${code}</div>
            <p style="margin:0;color:#98a2b3;font-size:13px;line-height:1.6">If you did not request this, you can safely ignore this email. Morrow will never ask you to send this code to another person.</p>
          </div>
        </div>`,
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
  };
  if (!response.ok) {
    return {
      ok: false,
      message: payload.message || "Resend could not deliver the email.",
    };
  }
  return { ok: true, providerReference: payload.id };
}

function twilioAuthorization() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim() ?? "";
  const token = process.env.TWILIO_AUTH_TOKEN?.trim() ?? "";
  return `Basic ${Buffer.from(`${accountSid}:${token}`).toString("base64")}`;
}

export async function startMorrowSmsCode(
  phone: string
): Promise<AuthDeliveryResult> {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();
  if (!getMorrowAuthProviderStatus().sms || !serviceSid) {
    return { ok: false, message: "SMS verification is not connected yet." };
  }

  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${encodeURIComponent(serviceSid)}/Verifications`,
    {
      method: "POST",
      headers: {
        Authorization: twilioAuthorization(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: phone, Channel: "sms" }),
    }
  );
  const payload = (await response.json().catch(() => ({}))) as {
    sid?: string;
    message?: string;
  };
  if (!response.ok) {
    return {
      ok: false,
      message: payload.message || "Twilio could not start verification.",
    };
  }
  return { ok: true, providerReference: payload.sid };
}

export async function verifyMorrowSmsCode(phone: string, code: string) {
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID?.trim();
  if (!getMorrowAuthProviderStatus().sms || !serviceSid) return false;

  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${encodeURIComponent(serviceSid)}/VerificationCheck`,
    {
      method: "POST",
      headers: {
        Authorization: twilioAuthorization(),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: phone, Code: code }),
    }
  );
  const payload = (await response.json().catch(() => ({}))) as {
    status?: string;
  };
  return response.ok && payload.status === "approved";
}
