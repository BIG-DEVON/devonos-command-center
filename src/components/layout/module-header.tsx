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
    <header className="devon-module-header mb-6 rounded-[22px] border border-black/[0.055] bg-white/92 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02),0_12px_36px_rgba(0,0,0,0.035)] sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f2f2f7] text-[#5f5f68]">
              <Icon size={17} strokeWidth={1.9} />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8e8e93]">
              {eyebrow}
            </span>
          </div>

          <h2 className="max-w-3xl text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-[#1d1d1f]">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6e6e73] sm:text-[15px]">
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
