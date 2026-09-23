import { Command } from "lucide-react";
import { CommandCenterClient } from "@/components/command/command-center-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function CommandPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Quick actions"
          title="Open a workspace or start work"
          description="Open a module, run a workflow, or use ⌘K to search from anywhere."
          icon={Command}
        />
        <CommandCenterClient />
      </section>
    </main>
  );
}
