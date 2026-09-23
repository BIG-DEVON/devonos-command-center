import { BarChart3 } from "lucide-react";
import { ReportsCommandClient } from "@/components/reports/reports-command-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function ReportsPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Reports"
          title="Workspace reports"
          description="Projects, KPIs, content, assets, people, events, news, and approvals in one report."
          icon={BarChart3}
        />
        <ReportsCommandClient />
      </section>
    </main>
  );
}
