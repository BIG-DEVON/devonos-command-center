import {
  BellRing,
  CheckCircle2,
  CircleDashed,
  Database,
  ExternalLink,
  Mail,
  MessageSquare,
} from "lucide-react";

const services = [
  {
    name: "Supabase",
    role: "Identity, sessions + Postgres",
    icon: Database,
    href: "https://supabase.com/dashboard/projects",
    keys: [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_SECRET_KEY",
    ],
    connected: () =>
      Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
          process.env.SUPABASE_SECRET_KEY
      ),
    label: "Production target",
  },
  {
    name: "Resend",
    role: "Auth SMTP + operational email",
    icon: Mail,
    href: "https://resend.com/domains",
    keys: ["RESEND_API_KEY", "MORROW_EMAIL_FROM"],
    connected: () =>
      Boolean(process.env.RESEND_API_KEY && process.env.MORROW_EMAIL_FROM),
    label: "Email delivery",
  },
  {
    name: "Twilio Verify",
    role: "Phone verification + SMS OTP",
    icon: MessageSquare,
    href: "https://console.twilio.com/us1/develop/verify/services",
    keys: [
      "TWILIO_ACCOUNT_SID",
      "TWILIO_AUTH_TOKEN",
      "TWILIO_VERIFY_SERVICE_SID",
    ],
    connected: () =>
      Boolean(
        process.env.TWILIO_ACCOUNT_SID &&
          process.env.TWILIO_AUTH_TOKEN &&
          process.env.TWILIO_VERIFY_SERVICE_SID
      ),
    label: "Phone OTP",
  },
  {
    name: "Web Push",
    role: "Browser and installed-app alerts",
    icon: BellRing,
    href: "https://web.dev/articles/push-notifications-overview",
    keys: ["VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY", "VAPID_SUBJECT"],
    connected: () =>
      Boolean(
        process.env.VAPID_PUBLIC_KEY &&
          process.env.VAPID_PRIVATE_KEY &&
          process.env.VAPID_SUBJECT
      ),
    label: "Device push",
  },
] as const;

export function MorrowServiceStack() {
  return (
    <section className="mt-5 rounded-[2.3rem] border border-black/[0.055] bg-white/70 p-6 shadow-[0_22px_70px_rgba(24,24,31,0.06)] backdrop-blur-2xl md:p-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#6d5dfc]">
            Service ownership
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[#17171b]">
            Your backend, visible.
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            Providers, responsibilities and connection status.
          </p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.15em] text-emerald-700">
          Supabase data active
        </span>
      </div>

      <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => {
          const connected = service.connected();
          const Icon = service.icon;
          return (
            <article key={service.name} className="group rounded-[1.6rem] border border-black/[0.055] bg-[#f8f7f3] p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_50px_rgba(24,24,31,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#6d5dfc] shadow-sm">
                  <Icon size={18} />
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em] ${connected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {connected ? <CheckCircle2 size={11} /> : <CircleDashed size={11} />}
                  {connected ? "Connected" : "Needs keys"}
                </span>
              </div>
              <p className="mt-5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">{service.label}</p>
              <h3 className="mt-1 text-lg font-extrabold tracking-[-0.025em] text-[#17171b]">{service.name}</h3>
              <p className="mt-1 min-h-10 text-xs font-semibold leading-5 text-slate-500">{service.role}</p>
              <div className="mt-4 space-y-1">
                {service.keys.map((key) => (
                  <p key={key} className="truncate font-mono text-[9px] font-bold text-slate-400">{key}</p>
                ))}
              </div>
              <a href={service.href} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#6d5dfc]">
                Open {service.name}
                <ExternalLink size={12} />
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
