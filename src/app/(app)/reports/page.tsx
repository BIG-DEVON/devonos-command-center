import { BarChart3 } from "lucide-react";
import { ReportsCommandClient } from "@/components/reports/reports-command-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function ReportsPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Executive intelligence"
          title="Know what is true. Decide what happens next."
          description="A defensible operating picture across projects, KPIs, content, assets, people, events, intelligence, and approvals—with every conclusion linked back to evidence."
          icon={BarChart3}
        />
        <ReportsCommandClient />
      </section>
    </main>
  );
}
