import { Settings } from "lucide-react";
import { SettingsCommandClient } from "@/components/settings/settings-command-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function SettingsPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Settings"
          title="Make DevonOS work the way you do."
          description="Set your identity, default tone, brand direction, writing rules, posting rules, and system preferences."
          icon={Settings}
        />
        <SettingsCommandClient />
      </section>
    </main>
  );
}
