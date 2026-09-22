import { ShieldCheck } from "lucide-react";
import { MorrowSecurityCenter } from "@/components/auth/morrow-security-center";
import { MorrowAccessControl } from "@/components/auth/morrow-access-control";
import { MorrowServiceStack } from "@/components/auth/morrow-service-stack";
import { ModuleHeader } from "@/components/layout/module-header";

export default function SecurityPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Access & Credentials"
          title="Identity & access"
          description="Members, approvals, recovery and sessions."
          icon={ShieldCheck}
        />
        <MorrowSecurityCenter />
        <MorrowAccessControl />
        <MorrowServiceStack />
      </section>
    </main>
  );
}
