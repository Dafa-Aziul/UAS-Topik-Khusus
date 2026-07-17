"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getActivityLogs,
  getAdminBookingTrend,
  getAdminDashboardSummary,
  getAdminRoomUsage,
  getMahasiswaDashboardSummary,
} from "@/lib/dashboard";
import type { ActivityLogListParams } from "@/types/dashboard";

export const dashboardKeys = {
  mahasiswaSummary: ["dashboards", "mahasiswa", "summary"] as const,
  adminSummary: ["dashboards", "admin", "summary"] as const,
  adminTrend: ["dashboards", "admin", "trend"] as const,
  adminRoomUsage: ["dashboards", "admin", "room-usage"] as const,
  activityLogs: (params: ActivityLogListParams) =>
    ["dashboards", "activity-logs", params] as const,
};

export function useMahasiswaDashboard() {
  return useQuery({
    queryKey: dashboardKeys.mahasiswaSummary,
    queryFn: getMahasiswaDashboardSummary,
    staleTime: 60_000,
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: dashboardKeys.adminSummary,
    queryFn: getAdminDashboardSummary,
    staleTime: 60_000,
  });
}

export function useAdminBookingTrend() {
  return useQuery({
    queryKey: dashboardKeys.adminTrend,
    queryFn: getAdminBookingTrend,
    staleTime: 60_000,
  });
}

export function useAdminRoomUsage() {
  return useQuery({
    queryKey: dashboardKeys.adminRoomUsage,
    queryFn: getAdminRoomUsage,
    staleTime: 60_000,
  });
}

export function useActivityLogs(params: ActivityLogListParams) {
  return useQuery({
    queryKey: dashboardKeys.activityLogs(params),
    queryFn: () => getActivityLogs(params),
    staleTime: 30_000,
  });
}
