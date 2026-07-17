"use client";

import { Bell, ChevronRight, HelpCircle, Menu } from "lucide-react";

type AppHeaderProps = {
  title: string;
  sectionLabel: string;
  userName: string;
  onOpenMobileMenu: () => void;
};

export function AppHeader({
  sectionLabel,
  userName,
  onOpenMobileMenu,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-3 sm:px-6">
      <div className="min-w-0 flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          className="text-[color:var(--color-primary)] md:hidden"
          onClick={onOpenMobileMenu}
          aria-label="Buka navigasi"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0">
          <div className="hidden items-center gap-2 text-sm text-[color:var(--color-text-secondary)] md:flex">
            <span>Apps</span>
            <ChevronRight className="size-3.5" />
            <span className="max-w-[20rem] truncate font-semibold text-[color:var(--color-primary)]">
              {sectionLabel}
            </span>
          </div>
          <h1 className="truncate text-base font-semibold text-[color:var(--color-primary)] sm:text-lg md:hidden">
            {sectionLabel}
          </h1>
        </div>
      </div>

      <div className="ml-3 flex shrink-0 items-center gap-3 sm:gap-6">
        <div className="hidden items-center gap-4 text-[color:var(--color-text-secondary)] sm:flex">
          <Bell className="size-4 cursor-pointer hover:text-[color:var(--color-primary-hover)]" />
          <HelpCircle className="size-4 cursor-pointer hover:text-[color:var(--color-primary-hover)]" />
        </div>
        <div className="hidden h-8 w-px bg-[color:var(--color-border)] sm:block" />
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-primary-fixed)] text-[color:var(--color-primary)]">
            <span className="text-xs font-bold">
              {userName.slice(0, 1).toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
