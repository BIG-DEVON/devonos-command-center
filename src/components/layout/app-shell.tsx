import { Sidebar } from "@/components/layout/sidebar";
import { TopCommandBar } from "@/components/layout/top-command-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="devon-app min-h-screen text-[#17171b]">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-[#17171b] px-4 py-2 text-sm font-semibold text-white shadow-xl transition focus:translate-y-0"
      >
        Skip to content
      </a>

      <div aria-hidden className="devon-app-glow" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <TopCommandBar />
          <div id="main-content" tabIndex={-1} className="pb-24 lg:pb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
