import { DashboardCommandClient } from "@/components/dashboard/dashboard-command-client";

export default function DashboardPage() {
  return (
    <main className="px-5 py-6 md:px-8">
      <section className="mx-auto max-w-7xl">
        <DashboardCommandClient />
      </section>
    </main>
  );
}