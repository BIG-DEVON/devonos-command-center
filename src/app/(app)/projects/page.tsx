import { Briefcase } from "lucide-react";
import { ProjectsCommandClient } from "@/components/projects/projects-command-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function ProjectsPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Projects"
          title="Move the important work forward."
          description="Keep every objective, owner, deliverable, deadline, and decision attached to the work it belongs to."
          icon={Briefcase}
        />
        <ProjectsCommandClient />
      </section>
    </main>
  );
}
