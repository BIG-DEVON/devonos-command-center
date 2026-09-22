import "server-only";

import webpush from "web-push";
import { prisma } from "@/lib/prisma";

export type DeliveryChannel = "email" | "sms" | "push";
export type NotificationSeverity = "info" | "success" | "warning" | "critical";

type ProviderState = {
  channel: DeliveryChannel;
  label: string;
  provider: string;
  ready: boolean;
  missing: string[];
};

type QueueOptions = {
  channels?: DeliveryChannel[];
  force?: boolean;
};

const severityRank: Record<NotificationSeverity, number> = {
  info: 0,
  success: 0,
  warning: 1,
  critical: 2,
};

function envReady(names: string[]) {
  return names.filter((name) => !process.env[name]?.trim());
}

export function notificationProviderStatus() {
  const emailMissing = envReady(["RESEND_API_KEY", "MORROW_EMAIL_FROM"]);
  const smsMissing = envReady([
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
  ]);
  if (
    !process.env.TWILIO_MESSAGING_SERVICE_SID?.trim() &&
    !process.env.TWILIO_FROM_NUMBER?.trim()
  ) {
    smsMissing.push("TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM_NUMBER");
  }
  const pushMissing = envReady([
    "VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY",
    "VAPID_SUBJECT",
  ]);

  const providers: ProviderState[] = [
    {
      channel: "email",
      label: "Email",
      provider: "Resend",
      ready: emailMissing.length === 0,
      missing: emailMissing,
    },
    {
      channel: "sms",
      label: "Phone SMS",
      provider: "Twilio",
      ready: smsMissing.length === 0,
      missing: smsMissing,
    },
    {
      channel: "push",
      label: "Web push",
      provider: "VAPID Web Push",
      ready: pushMissing.length === 0,
      missing: pushMissing,
    },
  ];

  return {
    providers,
    email: providers[0],
    sms: providers[1],
    push: providers[2],
    publicVapidKey: process.env.VAPID_PUBLIC_KEY?.trim() ?? "",
  };
}

function timeParts(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function localMinutes(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: timezone,
  }).formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0
  );
  return hour * 60 + minute;
}

function quietHoursState(settings: {
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
}) {
  if (!settings.quietHoursEnabled) {
    return { active: false, nextAttemptAt: null as Date | null };
  }

  const now = new Date();
  const current = localMinutes(now, settings.timezone);
  const start = timeParts(settings.quietHoursStart);
  const end = timeParts(settings.quietHoursEnd);
  const active =
    start === end
      ? false
      : start < end
        ? current >= start && current < end
        : current >= start || current < end;

  if (!active) return { active: false, nextAttemptAt: null as Date | null };

  const minutesUntilEnd =
    current < end ? end - current : 24 * 60 - current + end;
  return {
    active: true,
    nextAttemptAt: new Date(now.getTime() + Math.max(1, minutesUntilEnd) * 60_000),
  };
}

function normalizeSeverity(value: string): NotificationSeverity {
  if (value === "success" || value === "warning" || value === "critical") {
    return value;
  }
  return "info";
}

function allowsExternalDelivery(
  severity: NotificationSeverity,
  minimum: string
) {
  const normalizedMinimum =
    minimum === "critical" ? "critical" : minimum === "info" ? "info" : "warning";
  return severityRank[severity] >= severityRank[normalizedMinimum];
}

function providerFor(channel: DeliveryChannel) {
  const status = notificationProviderStatus();
  return status[channel];
}

export async function queueNotificationDeliveries(
  notificationId: string,
  options: QueueOptions = {}
) {
  const [notification, settings, subscriptions] = await Promise.all([
    prisma.notificationRecord.findUnique({ where: { id: notificationId } }),
    prisma.workspaceSettings.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.pushSubscriptionRecord.findMany({ where: { enabled: true } }),
  ]);

  if (!notification || !settings) return [];

  const severity = normalizeSeverity(notification.severity);
  if (
    !options.force &&
    !allowsExternalDelivery(severity, settings.externalMinimumSeverity)
  ) {
    return [];
  }

  const requested = options.channels ?? ["email", "sms", "push"];
  const targets: Array<{
    channel: DeliveryChannel;
    destination: string;
    provider: string;
  }> = [];

  if (
    requested.includes("email") &&
    (options.force || settings.emailNotifications) &&
    settings.notificationEmail
  ) {
    targets.push({
      channel: "email",
      destination: settings.notificationEmail,
      provider: "Resend",
    });
  }

  if (
    requested.includes("sms") &&
    (options.force || settings.smsNotifications) &&
    settings.notificationPhone
  ) {
    targets.push({
      channel: "sms",
      destination: settings.notificationPhone,
      provider: "Twilio",
    });
  }

  if (
    requested.includes("push") &&
    (options.force || settings.browserNotifications)
  ) {
    for (const subscription of subscriptions) {
      targets.push({
        channel: "push",
        destination: subscription.endpoint,
        provider: "VAPID Web Push",
      });
    }
  }

  const quiet = quietHoursState(settings);
  const created = [];
  for (const target of targets) {
    const provider = providerFor(target.channel);
    const blocked = !provider.ready;
    const deferred = quiet.active && severity !== "critical" && !options.force;
    const desiredStatus = blocked ? "Blocked" : deferred ? "Deferred" : "Queued";
    const lastError = blocked
      ? `Provider configuration missing: ${provider.missing.join(", ")}.`
      : "";
    const key = {
      notificationId_channel_destination: {
        notificationId,
        channel: target.channel,
        destination: target.destination,
      },
    };
    const existing = await prisma.notificationDelivery.findUnique({ where: key });
    if (existing?.status === "Sent") {
      created.push(existing);
      continue;
    }
    created.push(
      await prisma.notificationDelivery.upsert({
        where: key,
        update: {
          provider: target.provider,
          status: desiredStatus,
          nextAttemptAt: deferred ? quiet.nextAttemptAt : null,
          lastError,
        },
        create: {
          notificationId,
          channel: target.channel,
          destination: target.destination,
          provider: target.provider,
          status: desiredStatus,
          nextAttemptAt: deferred ? quiet.nextAttemptAt : null,
          lastError,
        },
      })
    );
  }

  return created;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

function notificationUrl(href: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  try {
    const baseUrl = new URL(base);
    const resolved = new URL(href || "/dashboard", baseUrl);
    if (!/^https?:$/.test(resolved.protocol) || resolved.origin !== baseUrl.origin) {
      return new URL("/dashboard", baseUrl).toString();
    }
    return resolved.toString();
  } catch {
    return new URL("/dashboard", base).toString();
  }
}

function emailMarkup(notification: {
  title: string;
  message: string;
  category: string;
  severity: string;
  href: string;
}) {
  const title = escapeHtml(notification.title);
  const message = escapeHtml(notification.message).replace(/\n/g, "<br />");
  const category = escapeHtml(notification.category);
  const severity = escapeHtml(notification.severity);
  const url = escapeHtml(notificationUrl(notification.href));
  const sentAt = escapeHtml(
    new Intl.DateTimeFormat("en-NG", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Lagos",
      timeZoneName: "short",
    }).format(new Date())
  );
  const palette =
    notification.severity === "critical"
      ? { background: "#fff1f2", foreground: "#a1122f", dot: "#e11d48" }
      : notification.severity === "warning"
        ? { background: "#fff7e6", foreground: "#8a5712", dot: "#d98b18" }
        : { background: "#f0efff", foreground: "#5748c8", dot: "#6d5dfc" };
  const preheader = escapeHtml(`${notification.title} — ${notification.message}`);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f3f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#17171b">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${preheader}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f3f3f6">
      <tr>
        <td align="center" style="padding:44px 16px">
          <table role="presentation" width="620" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;border-collapse:separate;background:#ffffff;border:1px solid #e8e8ee;border-radius:28px;overflow:hidden;box-shadow:0 24px 80px rgba(20,20,30,.10)">
            <tr>
              <td style="padding:25px 30px;background:#111116">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="vertical-align:middle">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="width:38px;height:38px;border-radius:12px;background:#ffffff;color:#111116;text-align:center;font-size:17px;font-weight:800">M</td>
                          <td style="padding-left:12px;color:#ffffff;font-size:17px;font-weight:750;letter-spacing:-.02em">Morrow</td>
                        </tr>
                      </table>
                    </td>
                    <td align="right" style="vertical-align:middle;color:#a8a7b2;font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">Command signal</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:42px 36px 18px">
                <div style="font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#8b8994">${category}</div>
                <h1 style="margin:14px 0 0;font-size:34px;line-height:1.12;letter-spacing:-.045em;color:#17171b">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px 24px">
                <span style="display:inline-block;border-radius:999px;padding:8px 12px;background:${palette.background};color:${palette.foreground};font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.13em"><span style="color:${palette.dot}">&#9679;</span>&nbsp;&nbsp;${severity}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:0 36px">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;background:#f7f7fa;border:1px solid #ececf1;border-radius:20px">
                  <tr>
                    <td style="padding:22px 23px;font-size:16px;line-height:1.7;color:#5f5e68">${message}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 36px 12px">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="border-radius:14px;background:#17171b">
                      <a href="${url}" style="display:inline-block;padding:15px 22px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:750">Open in Morrow&nbsp;&nbsp;&#8594;</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 36px 34px">
                <div style="font-size:11px;line-height:1.65;color:#9b99a3">Issued ${sentAt}. This signal follows your saved severity threshold and quiet-hours policy.</div>
                <div style="margin-top:14px;font-size:11px;line-height:1.65;color:#b0aeb7">If the button does not open, copy this secure workspace link:<br /><a href="${url}" style="color:#6d5dfc;text-decoration:none;word-break:break-all">${url}</a></div>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 30px;border-top:1px solid #eeeeF2;background:#fafafd;text-align:center;font-size:10px;line-height:1.7;color:#aaa8b2">Private Morrow workspace notification &middot; Delivery activity is retained for audit and support.</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendEmail(delivery: {
  id: string;
  destination: string;
  notification: {
    title: string;
    message: string;
    category: string;
    severity: string;
    href: string;
  };
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": delivery.id,
    },
    body: JSON.stringify({
      from: process.env.MORROW_EMAIL_FROM,
      to: [delivery.destination],
      subject: `${delivery.notification.severity === "critical" ? "Urgent · " : ""}${delivery.notification.title}`,
      text: `${delivery.notification.title}\n\n${delivery.notification.message}\n\nOpen in Morrow: ${notificationUrl(delivery.notification.href)}`,
      html: emailMarkup(delivery.notification),
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(
      payload.message || payload.error?.message || `Resend returned ${response.status}.`
    );
  }
  return payload.id ?? "accepted";
}

async function sendSms(delivery: {
  destination: string;
  notification: { title: string; message: string; href: string };
}) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID ?? "";
  const body = new URLSearchParams({
    To: delivery.destination,
    Body: `Morrow · ${delivery.notification.title}\n${delivery.notification.message}\n${notificationUrl(delivery.notification.href)}`.slice(
      0,
      1500
    ),
  });
  if (process.env.TWILIO_MESSAGING_SERVICE_SID?.trim()) {
    body.set("MessagingServiceSid", process.env.TWILIO_MESSAGING_SERVICE_SID);
  } else {
    body.set("From", process.env.TWILIO_FROM_NUMBER ?? "");
  }
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${process.env.TWILIO_AUTH_TOKEN ?? ""}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    }
  );
  const payload = (await response.json().catch(() => ({}))) as {
    sid?: string;
    message?: string;
  };
  if (!response.ok) {
    throw new Error(payload.message || `Twilio returned ${response.status}.`);
  }
  return payload.sid ?? "accepted";
}

async function sendPush(delivery: {
  id: string;
  destination: string;
  notification: {
    id: string;
    title: string;
    message: string;
    category: string;
    severity: string;
    href: string;
  };
}) {
  const subscription = await prisma.pushSubscriptionRecord.findUnique({
    where: { endpoint: delivery.destination },
  });
  if (!subscription?.enabled) throw new Error("Push subscription is unavailable.");
  const result = await webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth },
    },
    JSON.stringify({
      id: delivery.notification.id,
      tag: `morrow-${delivery.notification.id}`,
      title: delivery.notification.title,
      body: delivery.notification.message,
      category: delivery.notification.category,
      severity: delivery.notification.severity,
      url: delivery.notification.href || "/dashboard",
      timestamp: Date.now(),
    }),
    {
      TTL: 60 * 60 * 12,
      urgency: delivery.notification.severity === "critical" ? "high" : "normal",
      topic: delivery.id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32),
      vapidDetails: {
        subject: process.env.VAPID_SUBJECT ?? "mailto:admin@example.com",
        publicKey: process.env.VAPID_PUBLIC_KEY ?? "",
        privateKey: process.env.VAPID_PRIVATE_KEY ?? "",
      },
    }
  );
  return String(result.statusCode ?? 201);
}

function retryAt(attemptCount: number) {
  const delays = [5, 30, 120];
  const minutes = delays[Math.min(attemptCount, delays.length - 1)];
  return new Date(Date.now() + minutes * 60_000);
}

export async function dispatchPendingNotificationDeliveries(options: {
  notificationId?: string;
  limit?: number;
} = {}) {
  const now = new Date();
  const deliveries = await prisma.notificationDelivery.findMany({
    where: {
      ...(options.notificationId ? { notificationId: options.notificationId } : {}),
      attemptCount: { lt: 3 },
      OR: [
        { status: "Queued" },
        { status: "Deferred", nextAttemptAt: { lte: now } },
        { status: "Failed", nextAttemptAt: { lte: now } },
      ],
    },
    include: { notification: true },
    orderBy: { createdAt: "asc" },
    take: Math.min(50, Math.max(1, options.limit ?? 20)),
  });

  const results: Array<{ id: string; status: string; channel: string }> = [];
  for (const delivery of deliveries) {
    const provider = providerFor(delivery.channel as DeliveryChannel);
    if (!provider.ready) {
      await prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: "Blocked",
          lastError: `Provider configuration missing: ${provider.missing.join(", ")}.`,
        },
      });
      results.push({ id: delivery.id, status: "Blocked", channel: delivery.channel });
      continue;
    }

    const attemptCount = delivery.attemptCount + 1;
    await prisma.notificationDelivery.update({
      where: { id: delivery.id },
      data: { status: "Sending", attemptCount, lastAttemptAt: now, lastError: "" },
    });

    try {
      const providerMessageId =
        delivery.channel === "email"
          ? await sendEmail(delivery)
          : delivery.channel === "sms"
            ? await sendSms(delivery)
            : await sendPush(delivery);
      await prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: "Sent",
          providerMessageId,
          sentAt: new Date(),
          nextAttemptAt: null,
          lastError: "",
        },
      });
      results.push({ id: delivery.id, status: "Sent", channel: delivery.channel });
    } catch (error) {
      const statusCode =
        typeof error === "object" && error && "statusCode" in error
          ? Number((error as { statusCode?: number }).statusCode)
          : 0;
      if (delivery.channel === "push" && (statusCode === 404 || statusCode === 410)) {
        await prisma.pushSubscriptionRecord.updateMany({
          where: { endpoint: delivery.destination },
          data: { enabled: false },
        });
      }
      const finalFailure = attemptCount >= 3 || statusCode === 404 || statusCode === 410;
      await prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: finalFailure ? "Failed" : "Failed",
          nextAttemptAt: finalFailure ? null : retryAt(attemptCount - 1),
          lastError:
            error instanceof Error ? error.message.slice(0, 1000) : "Delivery failed.",
        },
      });
      results.push({ id: delivery.id, status: "Failed", channel: delivery.channel });
    }
  }

  return results;
}

export function redactDestination(channel: string, destination: string) {
  if (channel === "email") {
    const [name, domain] = destination.split("@");
    return name && domain ? `${name.slice(0, 2)}•••@${domain}` : "Email destination";
  }
  if (channel === "sms") {
    return destination.length > 4 ? `••••${destination.slice(-4)}` : "Phone destination";
  }
  return "Registered device";
}
