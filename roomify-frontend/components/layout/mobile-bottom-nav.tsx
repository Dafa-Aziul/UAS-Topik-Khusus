"use client";

import Link from "next/link";

import { getNavigationByRole, isNavigationItemActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/auth";

type MobileBottomNavProps = {
  currentPath: string;
  role: UserRole;
};

export function MobileBottomNav({
  currentPath,
  role,
}: MobileBottomNavProps) {
  const items = getNavigationByRole(role).slice(0, 4);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2 py-2 md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavigationItemActive(currentPath, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium",
                active
                  ? "bg-[color:var(--color-primary-container)] text-[color:var(--color-primary)]"
                  : "text-[color:var(--color-text-secondary)]",
              )}
            >
              <Icon className="size-4" />
              <span>{item.shortLabel ?? item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
