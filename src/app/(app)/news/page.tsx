import Link from "next/link";
import { ArrowUpRight, Newspaper, Search } from "lucide-react";
import { ModuleHeader } from "@/components/layout/module-header";
import { NewsIntelligenceClient } from "@/components/news/news-intelligence-client";

export default function NewsPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="News Intelligence"
          title="Know what matters before the day gets loud."
          description="Monitor trusted Nigerian sources for tax, revenue, JRB, and NRS developments—then turn the useful signals into a source-linked daily brief."
          icon={Newspaper}
          actions={
            <>
              <Link href="/search" className="devon-secondary-button">
                <Search size={15} />
                Search archive
              </Link>
              <Link href="/news/collector" className="devon-primary-button">
                Add a signal
                <ArrowUpRight size={15} />
              </Link>
            </>
          }
        />
        <NewsIntelligenceClient />
      </section>
    </main>
  );
}
