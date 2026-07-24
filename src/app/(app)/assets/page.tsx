import { Folder } from "lucide-react";
import { AssetLibraryClient } from "@/components/assets/asset-library-client";
import { ModuleHeader } from "@/components/layout/module-header";

export default function AssetsPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <ModuleHeader
          eyebrow="Asset Library"
          title="Everything ready when the work needs it."
          description="Keep official files, creative references, working links, and usage notes organized by project and status."
          icon={Folder}
        />
        <AssetLibraryClient />
      </section>
    </main>
  );
}
