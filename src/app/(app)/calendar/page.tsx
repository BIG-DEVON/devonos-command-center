import { CalendarDays } from "lucide-react";
import { CalendarCommandClient } from "@/components/calendar/calendar-command-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function CalendarPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Morrow Calendar"
          title="Time, finally made visible."
          description="One living calendar for world moments, Nigerian holidays, JRB compliance, birthdays, scheduled content, approvals, and deadlines."
          icon={CalendarDays}
        />
        <CalendarCommandClient />
      </section>
    </main>
  );
}
