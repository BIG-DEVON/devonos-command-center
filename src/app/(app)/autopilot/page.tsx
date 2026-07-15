import { AutopilotActionCenterClient } from "@/components/autopilot/autopilot-action-center-client";

export default function AutopilotPage() {
  return (
    <main className="px-5 py-6 md:px-8">
      <section className="mx-auto max-w-7xl">
        <AutopilotActionCenterClient />
      </section>
    </main>
  );
}