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
    <header className="devon-module-header mb-5 border-b border-black/[0.06] pb-5 pt-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[#f2f2f7] text-[#5f5f68]">
              <Icon size={15} strokeWidth={1.9} />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8e8e93]">
              {eyebrow}
            </span>
          </div>

          <h2 className="max-w-3xl text-[clamp(1.75rem,3vw,2.4rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[#1d1d1f]">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6e6e73]">
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
