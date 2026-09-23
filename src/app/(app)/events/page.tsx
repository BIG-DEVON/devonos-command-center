import { Globe2 } from "lucide-react";
import { GlobalEventsClient } from "@/components/events/global-events-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function EventsPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Events"
          title="Events and observances"
          description="Global observances, Nigerian holidays, JRB dates, and preparation deadlines."
          icon={Globe2}
        />
        <GlobalEventsClient />
      </section>
    </main>
  );
}
