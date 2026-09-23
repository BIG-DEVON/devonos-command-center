import { Search } from "lucide-react";
import { SearchCommandClient } from "@/components/search/search-command-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function SearchPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Workspace"
          title="Search"
          description="Find people, projects, decisions, content, dates, news, and automations."
          icon={Search}
        />
        <SearchCommandClient />
      </section>
    </main>
  );
}
