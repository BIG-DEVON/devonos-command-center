import { Sidebar } from "@/components/layout/sidebar";
import { TopCommandBar } from "@/components/layout/top-command-bar";
import { MorrowOnboarding } from "@/components/onboarding/morrow-onboarding";

export function AppShell({
  children,
  displayName,
  showOnboarding,
}: {
  children: React.ReactNode;
  displayName: string;
  showOnboarding: boolean;
}) {
  return (
    <div className="devon-app min-h-screen text-[#17171b]">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-[#17171b] px-4 py-2 text-sm font-semibold text-white shadow-xl transition focus:translate-y-0"
      >
        Skip to content
      </a>

      <div className="flex min-h-screen">
        <Sidebar displayName={displayName} />

        <div className="min-w-0 flex-1">
          <TopCommandBar />
          <div id="main-content" tabIndex={-1} className="pb-24 lg:pb-0">
            {children}
          </div>
        </div>
      </div>
      <MorrowOnboarding
        displayName={displayName}
        initialOpen={showOnboarding}
      />
    </div>
  );
}
