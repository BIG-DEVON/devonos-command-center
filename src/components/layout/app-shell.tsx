import { Sidebar } from "@/components/layout/sidebar";
import { TopCommandBar } from "@/components/layout/top-command-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="devon-bg min-h-screen text-[#0B0D12]">
      <div className="pointer-events-none fixed inset-0 devon-grid opacity-80" />

      <div className="pointer-events-none fixed left-[7%] top-[7%] h-80 w-80 rounded-full bg-blue-300/28 blur-3xl devon-orbit" />
      <div className="pointer-events-none fixed right-[8%] top-[9%] h-72 w-72 rounded-full bg-violet-300/24 blur-3xl devon-float" />
      <div className="pointer-events-none fixed bottom-[4%] left-[42%] h-80 w-80 rounded-full bg-[#D8B76A]/16 blur-3xl devon-soft-pulse" />

      <div className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-gradient-to-b from-white/80 to-transparent" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <TopCommandBar />
          {children}
        </div>
      </div>
    </div>
  );
}