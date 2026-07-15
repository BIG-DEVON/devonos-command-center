"use client";

import { motion } from "framer-motion";
import { AppWindow, Circle, Sparkles, Zap } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopCommandBar } from "@/components/layout/top-command-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="devon-v2-shell relative min-h-screen overflow-hidden text-[#07111f]">
      <div className="devon-v2-grid pointer-events-none fixed inset-0 z-0" />
      <div className="devon-v2-noise pointer-events-none fixed inset-0 z-0" />

      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="devon-v2-aurora pointer-events-none fixed left-[-10%] top-[-10%] z-0 h-[420px] w-[420px] rounded-full bg-blue-400/24"
      />

      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="devon-v2-aurora pointer-events-none fixed right-[-12%] top-[4%] z-0 h-[480px] w-[480px] rounded-full bg-violet-400/20"
      />

      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25, duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
        className="devon-v2-aurora pointer-events-none fixed bottom-[-14%] right-[18%] z-0 h-[440px] w-[440px] rounded-full bg-cyan-300/18"
      />

      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none fixed left-[320px] top-6 z-0 hidden xl:block"
      >
        <div className="devon-v2-float devon-v2-premium-border flex items-center gap-3 rounded-full bg-white/64 px-4 py-3 shadow-[0_20px_80px_rgba(37,99,235,0.14)] backdrop-blur-2xl">
          <div className="devon-v2-orb flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
            <Zap size={15} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              DevonOS V2
            </p>
            <p className="text-xs font-semibold text-slate-700">
              Premium motion layer active
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0, rotate: -6, y: 26 }}
        animate={{ opacity: 1, rotate: 0, y: 0 }}
        transition={{ delay: 0.5, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none fixed bottom-8 left-[330px] z-0 hidden 2xl:block"
      >
        <div className="devon-v2-float flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/70 bg-white/55 shadow-[0_26px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.35rem] bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-[0_18px_44px_rgba(37,99,235,0.26)]">
            <AppWindow size={24} />
          </div>
        </div>
      </motion.div>

      <motion.div
        aria-hidden
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.55, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none fixed right-10 top-[44%] z-0 hidden 2xl:block"
      >
        <div className="devon-v2-float rounded-[2rem] border border-white/70 bg-white/50 p-4 shadow-[0_24px_90px_rgba(15,23,42,0.1)] backdrop-blur-2xl">
          <div className="flex items-center gap-3 rounded-[1.4rem] bg-white/70 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Visual OS
              </p>
              <p className="text-xs font-semibold text-slate-700">
                Clean. Fast. Elite.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopCommandBar />

          <motion.div
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="pointer-events-none absolute left-8 right-8 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
            {children}
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-6 right-6 z-20 hidden md:block">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="devon-v2-premium-border flex items-center gap-3 rounded-full bg-white/72 px-4 py-3 shadow-[0_22px_70px_rgba(37,99,235,0.13)] backdrop-blur-2xl"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-35" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
          </span>
          <p className="text-xs font-bold text-slate-700">Database-backed</p>
          <Circle size={7} className="fill-violet-500 text-violet-500" />
          <p className="text-xs font-bold text-slate-700">Motion ready</p>
        </motion.div>
      </div>
    </div>
  );
}