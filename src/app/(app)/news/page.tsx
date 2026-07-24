import Link from "next/link";
import {
  ArrowUpRight,
  ClipboardList,
  FileText,
  Newspaper,
  Search,
  Send,
} from "lucide-react";
import { ModuleHeader } from "@/components/layout/module-header";

const workflow = [
  {
    title: "Collect",
    text: "Save the headline, source, link, and the detail that matters.",
    icon: ClipboardList,
  },
  {
    title: "Distill",
    text: "Turn scattered stories into a concise internal readout.",
    icon: FileText,
  },
  {
    title: "Share",
    text: "Copy a clean brief into the channel where the team already works.",
    icon: Send,
  },
];

const watchlist = [
  {
    title: "Tax reform implementation",
    description:
      "Policy changes, revenue administration, and institutional communication.",
  },
  {
    title: "Revenue authority activity",
    description:
      "Public mentions of revenue agencies, state tax authorities, and fiscal policy.",
  },
  {
    title: "Digital collections & compliance",
    description:
      "Electronic payments, compliance activity, and collection reform.",
  },
];

export default function NewsPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="News Intelligence"
          title="Turn public signals into a useful brief."
          description="Collect the stories that matter, preserve their source context, and shape them into a clear update for leadership."
          icon={Newspaper}
          actions={
            <>
              <Link href="/search" className="devon-secondary-button">
                <Search size={15} />
                Search archive
              </Link>
              <Link href="/news/collector" className="devon-primary-button">
                Open collector
                <ArrowUpRight size={15} />
              </Link>
            </>
          }
        />

        <div className="mb-5 grid gap-3 md:grid-cols-3">
          {workflow.map((item, index) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="devon-surface p-5">
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#f1f0ff] text-[#6d5dfc]">
                    <Icon size={17} />
                  </span>
                  <span className="text-[11px] font-semibold text-[#b0b0b7]">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-base font-semibold tracking-[-0.025em] text-[#242429]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#85858e]">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="devon-surface p-5 sm:p-6">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9a9aa2]">
                Current watchlist
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.045em] text-[#202025]">
                Signal categories
              </h3>
            </div>
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 sm:inline-flex">
              3 active
            </span>
          </div>

          <div className="grid gap-2 lg:grid-cols-3">
            {watchlist.map((item) => (
              <article
                key={item.title}
                className="rounded-[16px] border border-black/[0.055] bg-[#f7f7f9] p-4"
              >
                <h4 className="text-sm font-semibold text-[#333338]">
                  {item.title}
                </h4>
                <p className="mt-2 text-xs leading-5 text-[#8b8b94]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
