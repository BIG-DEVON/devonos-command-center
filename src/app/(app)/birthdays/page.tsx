import { Cake } from "lucide-react";
import { BirthdayIntelligenceClient } from "@/components/birthdays/birthday-intelligence-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function BirthdaysPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="People"
          title="Birthdays"
          description="Upcoming birthdays, member details, and prepared messages."
          icon={Cake}
        />
        <BirthdayIntelligenceClient />
      </section>
    </main>
  );
}
