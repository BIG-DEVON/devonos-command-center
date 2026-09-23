import { FileCheck2 } from "lucide-react";
import { ApprovalCenterClient } from "@/components/approvals/approval-center-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function ApprovalsPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Approvals"
          title="Approvals"
          description="Review work, record decisions, and keep the audit trail."
          icon={FileCheck2}
        />
        <ApprovalCenterClient />
      </section>
    </main>
  );
}
