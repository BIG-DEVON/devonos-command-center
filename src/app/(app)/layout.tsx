import { AppShell } from "@/components/layout/app-shell";
import { redirect } from "next/navigation";
import { getCurrentMorrowSession } from "@/lib/morrow-session";

export default async function ProtectedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentMorrowSession();
  if (!session) redirect("/login");

  return (
    <AppShell
      displayName={session.displayName}
      showOnboarding={!session.onboardingCompletedAt}
    >
      {children}
    </AppShell>
  );
}
