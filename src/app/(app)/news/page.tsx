import Link from "next/link";
import { ArrowUpRight, Newspaper, Search } from "lucide-react";
import { ModuleHeader } from "@/components/layout/module-header";
import { NewsIntelligenceClient } from "@/components/news/news-intelligence-client";

export default function NewsPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="News monitor"
          title="JRB news and tax developments"
          description="Track JRB, NRS, Nigerian tax reform, and revenue administration across official sources and established publishers."
          icon={Newspaper}
          actions={
            <>
              <Link href="/search" className="devon-secondary-button">
                <Search size={15} />
                Search news
              </Link>
              <Link href="/news/collector" className="devon-primary-button">
                Add article
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
