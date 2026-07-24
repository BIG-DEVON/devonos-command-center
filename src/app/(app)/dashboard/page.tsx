import { DashboardCommandClient } from "@/components/dashboard/dashboard-command-client";

export default function DashboardPage() {
  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1500px]">
        <DashboardCommandClient />
      </section>
    </main>
  );
}
