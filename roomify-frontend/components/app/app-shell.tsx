"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { logout as logoutRequest } from "@/lib/auth";
import { getSectionLabelByPath } from "@/lib/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileNavDrawer } from "@/components/layout/mobile-nav-drawer";
import { useAuthStore } from "@/store/auth-store";

type AppShellProps = {
  children: React.ReactNode;
  title: string;
};

export function AppShell({ children, title }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: async () => {
      clearSession();
      await queryClient.clear();
      toast.success("Sesi berhasil diakhiri.");
      router.replace("/login");
    },
  });

  if (!user) {
    return null;
  }

  const sectionLabel = getSectionLabelByPath(pathname, user.role);

  return (
    <div className="min-h-screen bg-[color:var(--color-background)] text-[color:var(--color-foreground)]">
      <AppSidebar
        currentPath={pathname}
        user={user}
        onLogout={() => logoutMutation.mutate()}
        isLoggingOut={logoutMutation.isPending}
      />

      <MobileNavDrawer
        currentPath={pathname}
        user={user}
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={() => logoutMutation.mutate()}
        isLoggingOut={logoutMutation.isPending}
      />

      <main className="min-h-screen pb-24 md:ml-64 md:pb-0">
        <AppHeader
          title={title}
          sectionLabel={sectionLabel}
          userName={user.name}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <div className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>

      <MobileBottomNav currentPath={pathname} role={user.role} />
    </div>
  );
}
