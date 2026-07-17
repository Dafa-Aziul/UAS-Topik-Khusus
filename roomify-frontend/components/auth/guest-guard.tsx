"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getDefaultRouteByRole } from "@/lib/routes";
import { useAuthStore } from "@/store/auth-store";

type GuestGuardProps = {
  children: React.ReactNode;
};

export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!isHydrated || !user) {
      return;
    }

    router.replace(getDefaultRouteByRole(user.role));
  }, [isHydrated, router, user]);

  if (!isHydrated) {
    return null;
  }

  if (user) {
    return null;
  }

  return children;
}
