import { Cake } from "lucide-react";
import { BirthdayIntelligenceClient } from "@/components/birthdays/birthday-intelligence-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function BirthdaysPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Birthday Intelligence"
          title="Make every personal moment count."
          description="Stay ahead of important birthdays, keep the right context close, and prepare messages that feel considered."
          icon={Cake}
        />
        <BirthdayIntelligenceClient />
      </section>
    </main>
  );
}
