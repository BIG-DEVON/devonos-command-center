import { Bot } from "lucide-react";
import { AiStudioClient } from "@/components/ai/ai-studio-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function AiPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="AI Studio"
          title="Shape raw thinking into useful drafts."
          description="Give every caption, statement, brief, and concept a clear direction—then keep the versions that are worth developing."
          icon={Bot}
        />
        <AiStudioClient />
      </section>
    </main>
  );
}
