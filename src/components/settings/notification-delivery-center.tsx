"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe2,
  LoaderCircle,
  Mail,
  Radio,
  RefreshCcw,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type { DevonSettings } from "@/lib/devon-settings";

type DeliveryChannel = "email" | "sms" | "push";

type DeliveryStatus = {
  ok: boolean;
  providers: Array<{
    channel: DeliveryChannel;
    label: string;
    provider: string;
    ready: boolean;
    setupNeeded: string[];
  }>;
  publicVapidKey: string;
  deviceCount: number;
  automation: {
    enabled: boolean;
    secured: boolean;
    time: string;
    timezone: string;
    nextRunAt: string | null;
    reminderDays: number[];
  };
  deliveries: Array<{
    id: string;
    channel: DeliveryChannel;
    provider: string;
    status: string;
    destination: string;
    title: string;
    severity: string;
    attempts: number;
    error: string;
    sentAt: string | null;
    createdAt: string;
  }>;
};

type UpdateField = <Key extends keyof DevonSettings>(
  key: Key,
  value: DevonSettings[Key]
) => void;

const channelMeta = {
  email: {
    label: "Email",
    description: "Polished, branded alerts that preserve the full context.",
    icon: Mail,
    gradient: "from-[#f7e7bd] via-[#fff7e7] to-white",
    accent: "text-[#9a6b12]",
  },
  sms: {
    label: "Phone SMS",
    description: "Short, urgent alerts for deadlines that cannot wait.",
    icon: Smartphone,
    gradient: "from-[#dff8f2] via-[#effbf8] to-white",
    accent: "text-[#087b66]",
  },
  push: {
    label: "Web push",
    description: "Native device alerts, even while Morrow is closed.",
    icon: BellRing,
    gradient: "from-[#e6e3ff] via-[#f1efff] to-white",
    accent: "text-[#5b4be1]",
  },
} as const;

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

function formatDeliveryTime(value: string | null) {
  if (!value) return "Not sent";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NotificationDeliveryCenter({
  settings,
  updateField,
  onSave,
}: {
  settings: DevonSettings;
  updateField: UpdateField;
  onSave: () => Promise<boolean>;
}) {
  const [status, setStatus] = useState<DeliveryStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [workingChannel, setWorkingChannel] = useState<DeliveryChannel | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "default"
  );
  const [notice, setNotice] = useState<{
    tone: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/notification-delivery/status", {
        cache: "no-store",
      });
      const data = (await response.json()) as DeliveryStatus & { message?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Delivery status is unavailable.");
      }
      setStatus(data);
    } catch (error) {
      console.error("Failed to load notification delivery center:", error);
      setNotice({ tone: "error", message: "Morrow could not load delivery health." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
    setPermission("Notification" in window ? Notification.permission : "unsupported");
  }, [loadStatus]);

  const readyCount = useMemo(
    () => status?.providers.filter((provider) => provider.ready).length ?? 0,
    [status]
  );

  async function registerThisDevice() {
    setWorkingChannel("push");
    setNotice(null);
    try {
      const pushProvider = status?.providers.find((provider) => provider.channel === "push");
      if (!pushProvider?.ready || !status?.publicVapidKey) {
        throw new Error("Web push keys need to be secured on the server first.");
      }
      if (
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window)
      ) {
        setPermission("unsupported");
        throw new Error("This browser does not support secure web push.");
      }

      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission);
      if (nextPermission !== "granted") {
        throw new Error(
          nextPermission === "denied"
            ? "Notifications are blocked in this browser's site settings."
            : "Permission is required before this device can receive alerts."
        );
      }

      const registration = await navigator.serviceWorker.register("/morrow-sw.js", {
        scope: "/",
      });
      await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(status.publicVapidKey),
        }));

      const response = await fetch("/api/push-subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...subscription.toJSON(),
          deviceLabel: `${navigator.platform || "Personal"} browser`,
        }),
      });
      const data = (await response.json()) as { ok: boolean; message?: string };
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Morrow could not register this device.");
      }

      updateField("browserNotifications", true);
      setNotice({
        tone: "success",
        message: "This device is registered. Save changes to make web push part of your live alert rules.",
      });
      await loadStatus();
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "Device registration failed.",
      });
    } finally {
      setWorkingChannel(null);
    }
  }

  async function sendTest(channel: DeliveryChannel) {
    setWorkingChannel(channel);
    setNotice(null);
    try {
      if ((channel === "email" || channel === "sms") && !(await onSave())) {
        throw new Error("Save a valid destination before testing delivery.");
      }
      const response = await fetch("/api/notification-delivery/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        message?: string;
        setupNeeded?: string[];
      };
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "The delivery test did not complete.");
      }
      setNotice({ tone: "success", message: data.message || "Test delivered." });
      await loadStatus();
    } catch (error) {
      setNotice({
        tone: "error",
        message: error instanceof Error ? error.message : "The delivery test failed.",
      });
      await loadStatus();
    } finally {
      setWorkingChannel(null);
    }
  }

  function provider(channel: DeliveryChannel) {
    return status?.providers.find((item) => item.channel === channel);
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[1.8rem] bg-[#111116] p-5 text-white shadow-[0_24px_70px_rgba(19,18,31,0.18)] sm:p-7">
        <div className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(circle_at_80%_0%,rgba(117,104,255,.38),transparent_32%),radial-gradient(circle_at_5%_100%,rgba(223,186,97,.22),transparent_35%)]" />
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full border border-white/[0.07]" />
        <div className="pointer-events-none absolute -right-4 top-20 h-44 w-44 rounded-full border border-white/[0.07]" />

        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.19em] text-white/55">
              <Radio size={12} className="text-[#a99fff]" />
              Delivery channels
            </div>
            <h3 className="mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
              Email, SMS, and push notifications
            </h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/48">
              External alerts follow your permissions, severity threshold, and quiet hours. Each delivery is recorded for support and audit.
            </p>
          </div>

          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.07] p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/38">
                  Channel status
                </p>
                <p className="mt-2 text-2xl font-semibold">{loading ? "—" : `${readyCount} / 3`}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#17171b] shadow-xl">
                {loading ? <LoaderCircle size={19} className="animate-spin" /> : <Globe2 size={19} />}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {(["email", "sms", "push"] as DeliveryChannel[]).map((channel) => (
                <span
                  key={channel}
                  className={`h-1.5 flex-1 rounded-full ${provider(channel)?.ready ? "bg-[#8f83ff]" : "bg-white/12"}`}
                />
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-5 text-white/38">
              {status?.deviceCount ?? 0} registered push {status?.deviceCount === 1 ? "device" : "devices"}
            </p>
          </div>
        </div>
      </section>

      {notice ? (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-[1.45rem] border p-4 text-sm ${
            notice.tone === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : notice.tone === "error"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-indigo-200 bg-indigo-50 text-indigo-800"
          }`}
        >
          {notice.tone === "success" ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          ) : (
            <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          )}
          <p className="leading-6">{notice.message}</p>
        </div>
      ) : null}

      <section className="devon-glass rounded-[2.25rem] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-slate-400">
              Live channels
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[#17171b]">
              Choose how Morrow reaches you.
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              In-app stays immediate. External channels follow your severity threshold and quiet hours.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadStatus()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-950/[0.08] bg-white px-3 text-xs font-semibold text-slate-500 transition hover:text-[#17171b]"
          >
            <RefreshCcw size={13} />
            Refresh health
          </button>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {(["email", "sms", "push"] as DeliveryChannel[]).map((channel) => {
            const meta = channelMeta[channel];
            const currentProvider = provider(channel);
            const Icon = meta.icon;
            const enabled =
              channel === "email"
                ? settings.emailNotifications
                : channel === "sms"
                  ? settings.smsNotifications
                  : settings.browserNotifications;
            const testDisabled =
              workingChannel !== null ||
              !currentProvider?.ready ||
              (channel === "email" && !settings.notificationEmail) ||
              (channel === "sms" && !settings.notificationPhone) ||
              (channel === "push" && !status?.deviceCount);

            return (
              <article
                key={channel}
                className={`relative overflow-hidden rounded-[1.85rem] border border-slate-950/[0.07] bg-gradient-to-br ${meta.gradient} p-5`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-[0_12px_35px_rgba(30,30,45,.08)] ${meta.accent}`}>
                    <Icon size={19} />
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                      currentProvider?.ready
                        ? "bg-white/80 text-emerald-700"
                        : "bg-white/70 text-slate-400"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${currentProvider?.ready ? "bg-emerald-500" : "bg-slate-300"}`} />
                    {currentProvider?.ready ? "Provider live" : "Setup needed"}
                  </span>
                </div>

                <h4 className="mt-5 text-lg font-semibold text-[#17171b]">{meta.label}</h4>
                <p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{meta.description}</p>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  {currentProvider?.provider ?? "Checking provider"}
                </p>

                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-950/[0.07] pt-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => {
                      if (channel === "email") updateField("emailNotifications", !enabled);
                      if (channel === "sms") updateField("smsNotifications", !enabled);
                      if (channel === "push") updateField("browserNotifications", !enabled);
                    }}
                    className={`relative h-7 w-12 rounded-full transition ${enabled ? "bg-[#17171b]" : "bg-slate-300/80"}`}
                  >
                    <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${enabled ? "left-6" : "left-1"}`} />
                  </button>
                  {channel === "push" && (!status?.deviceCount || permission !== "granted") ? (
                    <button
                      type="button"
                      onClick={() => void registerThisDevice()}
                      disabled={workingChannel !== null || !currentProvider?.ready}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#17171b] px-3 py-2 text-[11px] font-bold text-white transition disabled:opacity-35"
                    >
                      {workingChannel === "push" ? <LoaderCircle size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      Register device
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void sendTest(channel)}
                      disabled={testDisabled}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[11px] font-bold text-[#17171b] shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {workingChannel === channel ? <LoaderCircle size={13} className="animate-spin" /> : <Send size={13} />}
                      Send test
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.08fr_.92fr]">
          <div className="rounded-[1.75rem] border border-slate-950/[0.07] bg-white/65 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  Advance reminder rhythm
                </p>
                <h4 className="mt-2 text-lg font-semibold tracking-tight text-[#17171b]">
                  Enough notice to act, never just react.
                </h4>
              </div>
              <Clock3 size={18} className="mt-0.5 shrink-0 text-[#6d5dfc]" />
            </div>
            <div className="mt-5 grid grid-cols-5 gap-2">
              {[
                ["14d", "Awareness"],
                ["7d", "Prepare"],
                ["3d", "Review"],
                ["1d", "Final check"],
                ["Today", "Act"],
              ].map(([day, label], index) => (
                <div key={day} className="min-w-0 text-center">
                  <div className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-extrabold ${index === 4 ? "bg-[#17171b] text-white" : "border border-[#6d5dfc]/15 bg-[#f2f0ff] text-[#5b4be1]"}`}>
                    {day}
                  </div>
                  <p className="mt-2 truncate text-[9px] font-semibold text-slate-400">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[11px] leading-5 text-slate-400">
              Morrow checks birthdays and major events up to 14 days ahead, then reminds you 7, 3, and 1 day before the event and again on the day. Your daily check runs at {status?.automation.time ?? settings.dailyBriefTime} ({(status?.automation.timezone ?? settings.timezone).replace("_", " ")}).
            </p>
            <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold ${status?.automation.secured && status?.automation.enabled ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status?.automation.secured && status?.automation.enabled ? "bg-emerald-500" : "bg-amber-500"}`} />
              {status?.automation.secured && status?.automation.enabled
                ? "Sweep endpoint ready for deployment scheduler"
                : "Automatic sweep needs deployment scheduling"}
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-slate-950/[0.07] bg-white shadow-[0_18px_50px_rgba(22,21,34,.07)]">
            <div className="flex items-center justify-between bg-[#111116] px-5 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-xs font-black text-[#111116]">M</span>
                <span className="text-sm font-semibold">Morrow</span>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">Email preview</span>
            </div>
            <div className="p-5">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.17em] text-slate-400">Birthday · advance reminder</p>
              <h4 className="mt-2 text-lg font-semibold tracking-tight text-[#17171b]">A birthday is coming up.</h4>
              <div className="mt-3 rounded-2xl border border-slate-950/[0.06] bg-[#f7f7fa] p-3.5 text-[11px] leading-5 text-slate-500">
                Review the message and final visual before the day gets busy.
              </div>
              <span className="mt-4 inline-flex rounded-xl bg-[#17171b] px-3.5 py-2 text-[10px] font-bold text-white">Open in Morrow&nbsp; →</span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_260px]">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Delivery email</span>
            <div className="mt-2 flex h-12 items-center gap-3 rounded-2xl border border-slate-950/[0.08] bg-white/75 px-4 focus-within:border-[#7c72ee]/35 focus-within:ring-4 focus-within:ring-[#7c72ee]/[0.07]">
              <Mail size={15} className="text-slate-300" />
              <input
                type="email"
                value={settings.notificationEmail}
                onChange={(event) => updateField("notificationEmail", event.target.value)}
                placeholder="you@organization.com"
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#17171b] outline-none placeholder:text-slate-300"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Phone number</span>
            <div className="mt-2 flex h-12 items-center gap-3 rounded-2xl border border-slate-950/[0.08] bg-white/75 px-4 focus-within:border-[#7c72ee]/35 focus-within:ring-4 focus-within:ring-[#7c72ee]/[0.07]">
              <Smartphone size={15} className="text-slate-300" />
              <input
                type="tel"
                value={settings.notificationPhone}
                onChange={(event) => updateField("notificationPhone", event.target.value)}
                placeholder="+234 801 234 5678"
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#17171b] outline-none placeholder:text-slate-300"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">External alert level</span>
            <select
              value={settings.externalMinimumSeverity}
              onChange={(event) => updateField("externalMinimumSeverity", event.target.value as DevonSettings["externalMinimumSeverity"])}
              className="mt-2 h-12 w-full rounded-2xl border border-slate-950/[0.08] bg-white/75 px-4 text-sm font-semibold text-[#17171b] outline-none focus:border-[#7c72ee]/35 focus:ring-4 focus:ring-[#7c72ee]/[0.07]"
            >
              <option value="info">Everything</option>
              <option value="warning">Important + critical</option>
              <option value="critical">Critical only</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-[1.45rem] border border-slate-950/[0.06] bg-white/55 p-4">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#6e63e9]" />
          <div>
            <p className="text-sm font-semibold text-[#17171b]">Private by design</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Provider secrets stay on the server. Morrow stores only delivery status, a protected destination, and the provider receipt needed for support and audit.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <ProviderStep
            title="Email activation"
            state={provider("email")?.ready ? "ready" : "owner"}
            description={
              provider("email")?.ready
                ? "Resend credentials and the sending identity are secured."
                : "Create a Resend account, verify your sending domain, then add the server credentials."
            }
            href={provider("email")?.ready ? undefined : "https://resend.com/signup"}
          />
          <ProviderStep
            title="SMS activation"
            state={provider("sms")?.ready ? "ready" : "owner"}
            description={
              provider("sms")?.ready
                ? "Twilio credentials and a sender are secured."
                : "Create a Twilio account, verify the business, and connect a sender or Messaging Service."
            }
            href={provider("sms")?.ready ? undefined : "https://www.twilio.com/try-twilio"}
          />
          <ProviderStep
            title="Web push activation"
            state={provider("push")?.ready ? "ready" : "server"}
            description={
              provider("push")?.ready
                ? "Morrow's push keys are secured. Register each approved browser after hosting."
                : "Secure one VAPID key pair on the server, then register approved devices."
            }
          />
        </div>
      </section>

      <section className="devon-glass rounded-[2.25rem] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.19em] text-slate-400">Delivery history</p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-[#17171b]">Sent notification records</h3>
          </div>
          <Clock3 size={18} className="text-slate-300" />
        </div>

        {status?.deliveries.length ? (
          <div className="mt-5 grid gap-2">
            {status.deliveries.map((delivery) => {
              const Icon = channelMeta[delivery.channel]?.icon ?? Radio;
              const successful = delivery.status === "Sent";
              return (
                <div key={delivery.id} className="flex items-center gap-3 rounded-2xl border border-slate-950/[0.06] bg-white/62 p-3.5">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${successful ? "bg-emerald-50 text-emerald-600" : delivery.status === "Blocked" || delivery.status === "Failed" ? "bg-rose-50 text-rose-500" : "bg-indigo-50 text-indigo-500"}`}>
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#17171b]">{delivery.title}</p>
                    <p className="mt-1 truncate text-[11px] text-slate-400">
                      {delivery.provider} · {delivery.destination} · {formatDeliveryTime(delivery.sentAt ?? delivery.createdAt)}
                    </p>
                  </div>
                  <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${successful ? "bg-emerald-50 text-emerald-700" : delivery.status === "Blocked" || delivery.status === "Failed" ? "bg-rose-50 text-rose-700" : "bg-indigo-50 text-indigo-700"}`}>
                    {successful ? <Check size={11} /> : null}
                    {delivery.status}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 rounded-[1.6rem] border border-dashed border-slate-300/70 p-7 text-center">
            <Radio size={20} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-500">No external notifications yet.</p>
            <p className="mt-1 text-xs text-slate-400">Your first test or live alert will appear here with a real delivery status.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function ProviderStep({
  title,
  description,
  state,
  href,
}: {
  title: string;
  description: string;
  state: "ready" | "owner" | "server";
  href?: string;
}) {
  const label = state === "ready" ? "Ready" : state === "owner" ? "Owner step" : "Server step";
  return (
    <div className="rounded-[1.35rem] border border-slate-950/[0.06] bg-white/48 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-[#17171b]">{title}</p>
        <span className={`rounded-full px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] ${state === "ready" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
          {label}
        </span>
      </div>
      <p className="mt-2 text-[11px] leading-5 text-slate-400">{description}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#5b4be1]"
        >
          Open official setup
          <ExternalLink size={11} />
        </a>
      ) : null}
    </div>
  );
}
