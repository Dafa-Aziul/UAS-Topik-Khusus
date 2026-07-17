"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getDefaultRouteByRole } from "@/lib/routes";
import { useAuthStore } from "@/store/auth-store";
import type { UserRole } from "@/types/auth";

type AuthGuardProps = {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
};

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(getDefaultRouteByRole(user.role));
    }
  }, [allowedRoles, isHydrated, router, user]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="rounded-3xl border border-[color:var(--color-border)] bg-white px-6 py-4 text-sm text-[color:var(--color-text-secondary)] shadow-sm">
          Memeriksa sesi Anda...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
}
