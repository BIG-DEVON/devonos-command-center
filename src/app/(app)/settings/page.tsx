import { Settings } from "lucide-react";
import { SettingsCommandClient } from "@/components/settings/settings-command-client";
import { ModuleHeader } from "@/components/layout/module-header";
import { getCurrentMorrowSession } from "@/lib/morrow-session";
import {
  canManageAccess,
  canManageWorkspace,
} from "@/lib/morrow-permissions";

export default async function SettingsPage() {
  const session = await getCurrentMorrowSession({ touch: false });
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Settings"
          title="Workspace settings"
          description="Manage appearance, alerts, schedule, identity, data protection, and member access."
          icon={Settings}
        />
        <SettingsCommandClient
          canManageAccess={canManageAccess(session?.role ?? "")}
          canManageWorkspace={canManageWorkspace(session?.role ?? "")}
        />
      </section>
    </main>
  );
}
