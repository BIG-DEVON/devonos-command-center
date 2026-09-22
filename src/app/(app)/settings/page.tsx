import { Settings } from "lucide-react";
import { SettingsCommandClient } from "@/components/settings/settings-command-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function SettingsPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Settings"
          title="Your system, on your terms."
          description="Control appearance, sound, alerts, schedule, identity, data safety, and the access model for your private command center."
          icon={Settings}
        />
        <SettingsCommandClient />
      </section>
    </main>
  );
}
