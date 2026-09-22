import { Search } from "lucide-react";
import { SearchCommandClient } from "@/components/search/search-command-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function SearchPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Morrow Universal Search"
          title="Everything, within reach."
          description="Search people, portraits, projects, decisions, content, dates, signals, automations, and every workspace from one beautifully ranked index."
          icon={Search}
        />
        <SearchCommandClient />
      </section>
    </main>
  );
}
