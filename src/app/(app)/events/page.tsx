import { Globe2 } from "lucide-react";
import { GlobalEventsClient } from "@/components/events/global-events-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function EventsPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="World · Nigeria · JRB"
          title="Know what the world is about to celebrate."
          description="A sourced cultural and institutional radar for global observances, Nigerian holidays, JRB compliance moments, and the stories worth preparing early."
          icon={Globe2}
        />
        <GlobalEventsClient />
      </section>
    </main>
  );
}
