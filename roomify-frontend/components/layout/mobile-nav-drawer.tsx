"use client";

import { X } from "lucide-react";

import { getRoleShellTitle } from "@/lib/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import type { AuthUser } from "@/types/auth";

type MobileNavDrawerProps = {
  currentPath: string;
  user: AuthUser;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
};

export function MobileNavDrawer({
  currentPath,
  user,
  open,
  onClose,
  onLogout,
  isLoggingOut,
}: MobileNavDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[1px] md:hidden">
      <div className="h-full w-80 max-w-[84vw] bg-[color:var(--color-surface)] p-5 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-[color:var(--color-primary)]">
              Roomify
            </p>
            <p className="text-sm text-[color:var(--color-text-secondary)]">
              {getRoleShellTitle(user.role)}
            </p>
          </div>
          <button
            type="button"
            className="text-[color:var(--color-text-secondary)]"
            onClick={onClose}
            aria-label="Tutup navigasi"
          >
            <X className="size-5" />
          </button>
        </div>

        <AppSidebar
          currentPath={currentPath}
          user={user}
          onLogout={onLogout}
          isLoggingOut={isLoggingOut}
          mobile
        />
      </div>
    </div>
  );
}
