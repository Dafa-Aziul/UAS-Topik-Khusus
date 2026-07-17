"use client";

import { create } from "zustand";

import type { AuthUser } from "@/types/auth";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  isHydrated: boolean;
  isAuthenticated: boolean;
  setSession: (payload: { accessToken: string; user: AuthUser | null }) => void;
  clearSession: () => void;
  markHydrated: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isHydrated: false,
  isAuthenticated: false,
  setSession: ({ accessToken, user }) =>
    set({ accessToken, user, isAuthenticated: Boolean(accessToken && user) }),
  clearSession: () =>
    set({ accessToken: null, user: null, isAuthenticated: false }),
  markHydrated: () => set({ isHydrated: true }),
}));
