import { CalendarDays } from "lucide-react";
import { CalendarCommandClient } from "@/components/calendar/calendar-command-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function CalendarPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Calendar"
          title="See the next four weeks at a glance."
          description="Bring events, birthdays, scheduled content, project dates, and deadlines into one planning view."
          icon={CalendarDays}
        />
        <CalendarCommandClient />
      </section>
    </main>
  );
}
