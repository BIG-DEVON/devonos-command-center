import { Command } from "lucide-react";
import { CommandCenterClient } from "@/components/command/command-center-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function CommandPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Command Center"
          title="Every action, one search away."
          description="Open any workspace, run a core workflow, or copy today’s checklist without breaking focus. Press ⌘K anywhere to jump."
          icon={Command}
        />
        <CommandCenterClient />
      </section>
    </main>
  );
}
