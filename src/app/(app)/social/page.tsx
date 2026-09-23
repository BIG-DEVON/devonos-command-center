import { Send } from "lucide-react";
import { SocialStudioClient } from "@/components/social/social-studio-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function SocialPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Social Studio"
          title="Social content"
          description="Prepare posts, attach campaign context, and move each draft through review."
          icon={Send}
        />
        <SocialStudioClient />
      </section>
    </main>
  );
}
