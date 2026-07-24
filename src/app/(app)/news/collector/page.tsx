import Link from "next/link";
import { ArrowLeft, Newspaper } from "lucide-react";
import { NewsCollectorClient } from "@/components/news/news-collector-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function NewsCollectorPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="News Collector"
          title="Build today’s intelligence brief."
          description="Add the relevant stories, keep the source attached, and prepare a polished internal update in one pass."
          icon={Newspaper}
          actions={
            <Link href="/news" className="devon-secondary-button">
              <ArrowLeft size={15} />
              News intelligence
            </Link>
          }
        />
        <NewsCollectorClient />
      </section>
    </main>
  );
}
