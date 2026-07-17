import axios, { isAxiosError } from "axios";

import { env } from "@/lib/env";
import { useAuthStore } from "@/store/auth-store";

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const refreshClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    config.headers.set("Content-Type", undefined);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? "";
    const shouldSkipRefresh =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register") ||
      requestUrl.includes("/auth/refresh");

    if (
      status !== 401 ||
      !originalRequest ||
      shouldSkipRefresh ||
      originalRequest.headers["x-retried-after-refresh"]
    ) {
      return Promise.reject(error);
    }

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post<{ data: { access_token: string } }>("/auth/refresh")
          .then((response) => response.data.data.access_token)
          .catch(() => null)
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;

      if (!newToken) {
        useAuthStore.getState().clearSession();
        return Promise.reject(error);
      }

      useAuthStore.getState().setSession({
        accessToken: newToken,
        user: useAuthStore.getState().user,
      });

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      originalRequest.headers["x-retried-after-refresh"] = "true";

      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    }
  },
);
