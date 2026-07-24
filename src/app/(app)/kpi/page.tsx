import { Target } from "lucide-react";
import { KpiCommandClient } from "@/components/kpi/kpi-command-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function KpiPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="KPI Command"
          title="Keep the outcomes in view."
          description="Track ownership, priority, due dates, progress, and blockers in a single reliable performance view."
          icon={Target}
        />
        <KpiCommandClient />
      </section>
    </main>
  );
}
