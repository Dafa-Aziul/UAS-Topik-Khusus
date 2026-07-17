"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";

import { getCurrentUser, refreshSession } from "@/lib/auth";
import { QueryProvider } from "@/providers/query-provider";
import { useAuthStore } from "@/store/auth-store";

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const markHydrated = useAuthStore((state) => state.markHydrated);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    let cancelled = false;

    const bootstrapSession = async () => {
      try {
        const refreshResult = await refreshSession();
        const accessToken = refreshResult.data.access_token;
        const meResult = await getCurrentUser(accessToken);

        if (!cancelled) {
          setSession({ accessToken, user: meResult.data });
        }
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          markHydrated();
        }
      }
    };

    void bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [clearSession, markHydrated, setSession]);

  return (
    <QueryProvider>
      {children}
      <Toaster position="bottom-right" richColors />
    </QueryProvider>
  );
}
