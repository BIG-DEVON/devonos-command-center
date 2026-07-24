import type { ElementType, ReactNode } from "react";

export function ModuleHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: ElementType;
  actions?: ReactNode;
}) {
  return (
    <header className="devon-module-header mb-6 overflow-hidden rounded-[28px] border border-black/[0.06] bg-white/78 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_20px_60px_rgba(0,0,0,0.055)] backdrop-blur-xl sm:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-black/[0.055] bg-[#f2f1ff] text-[#6558e8]">
              <Icon size={17} strokeWidth={1.9} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#8f8f98]">
              {eyebrow}
            </span>
            <span className="h-1 w-1 rounded-full bg-[#c4c4ca]" />
            <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>

          <h2 className="max-w-3xl text-[clamp(2.15rem,5vw,4.45rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-[#18181c]">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#797982] sm:text-[15px] sm:leading-7">
            {description}
          </p>
        </div>

        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
