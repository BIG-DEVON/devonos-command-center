import Link from "next/link";
import { ArrowLeft, Newspaper } from "lucide-react";
import { NewsCollectorClient } from "@/components/news/news-collector-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function NewsCollectorPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="News monitor"
          title="Add news article"
          description="Save an article with its source, topic, date, and review status."
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
