"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getDefaultRouteByRole } from "@/lib/routes";
import { useAuthStore } from "@/store/auth-store";

export function HomeRedirect() {
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

    router.replace(getDefaultRouteByRole(user.role));
  }, [isHydrated, router, user]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="rounded-3xl border border-[color:var(--color-border)] bg-white px-6 py-4 text-sm text-[color:var(--color-text-secondary)] shadow-sm">
        Menentukan halaman tujuan Anda...
      </div>
    </div>
  );
}
