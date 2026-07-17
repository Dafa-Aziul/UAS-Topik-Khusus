"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";

import {
  getNavigationByRole,
  getRoleLabel,
  isNavigationItemActive,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/types/auth";

type AppSidebarProps = {
  currentPath: string;
  user: AuthUser;
  onLogout: () => void;
  isLoggingOut: boolean;
  mobile?: boolean;
};

export function AppSidebar({
  currentPath,
  user,
  onLogout,
  isLoggingOut,
  mobile = false,
}: AppSidebarProps) {
  const items = getNavigationByRole(user.role);

  return (
    <aside
      className={cn(
        "border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6",
        mobile
          ? "flex h-full flex-col"
          : "hidden h-screen w-64 shrink-0 border-r md:fixed md:left-0 md:top-0 md:flex md:flex-col",
      )}
    >
      <div className="mb-10">
        <p className="text-3xl font-bold tracking-[-0.03em] text-[color:var(--color-primary)]">
          Roomify
        </p>
        <p className="mt-1 text-sm text-[color:var(--color-text-secondary)] opacity-80">
          {getRoleLabel(user.role)}
        </p>
      </div>

      <nav className="flex-1 space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isNavigationItemActive(currentPath, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex w-full items-center gap-3 rounded-[1.1rem] px-4 py-3 text-sm font-semibold transition-colors duration-200",
                active
                  ? "border-r-[5px] border-[color:var(--color-primary)] bg-[color:var(--color-secondary-container)]/40 !text-[color:var(--color-primary)] shadow-[inset_0_1px_0_rgba(255, 255, 255, 0.45)] hover:bg-[color:var(--color-secondary-container)]/60 hover:!text-[color:var(--color-primary)]"
                  : "text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-surface-subtle)] hover:text-[color:var(--color-text-primary)]",
              )}
            >
              <Icon className={cn("size-5", active && "!text-[color:var(--color-primary)]")} />
              <span className={cn(active && "!text-[color:var(--color-primary)]")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[color:var(--color-border)] pt-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-[color:var(--color-primary-fixed)] text-[color:var(--color-primary)]">
            <span className="text-sm font-bold">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[color:var(--color-text-primary)]">
              {user.name}
            </p>
            <p className="truncate text-xs text-[color:var(--color-text-secondary)]">
              {user.role === "ADMIN" ? "Administrator" : `NIM: ${user.nim ?? "-"}`}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-4 h-10 w-full rounded-xl"
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="size-4" />
          {isLoggingOut ? "Keluar..." : "Logout"}
        </Button>
      </div>
    </aside>
  );
}
