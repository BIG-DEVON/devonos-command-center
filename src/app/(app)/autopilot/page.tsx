import { AutopilotActionCenterClient } from "@/components/autopilot/autopilot-action-center-client";
import { AutopilotContentFactoryClient } from "@/components/autopilot/autopilot-content-factory-client";
import { AutopilotStartDayClient } from "@/components/autopilot/autopilot-start-day-client";
import { AutopilotTaskQueueClient } from "@/components/autopilot/autopilot-task-queue-client";

export default function AutopilotPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px] space-y-5">
        <AutopilotStartDayClient />
        <AutopilotContentFactoryClient />
        <AutopilotActionCenterClient />
        <AutopilotTaskQueueClient />
      </section>
    </main>
  );
}
