import { api } from "@/lib/axios";
import type { ApiEnvelope, ApiMeta } from "@/types/api";
import type {
  ActivityLog,
  ActivityLogListParams,
  AdminDashboardSummary,
  BookingTrendPoint,
  MahasiswaDashboardSummary,
  RoomUsageItem,
} from "@/types/dashboard";

type DashboardSummaryResponse<T> = ApiEnvelope<T>;
type ActivityLogListResponse = ApiEnvelope<ActivityLog[], ApiMeta>;

export async function getMahasiswaDashboardSummary() {
  const response = await api.get<DashboardSummaryResponse<MahasiswaDashboardSummary>>(
    "/dashboards/me",
  );

  return response.data;
}

export async function getAdminDashboardSummary() {
  const response = await api.get<DashboardSummaryResponse<AdminDashboardSummary>>(
    "/dashboards/admin",
  );

  return response.data;
}

export async function getAdminBookingTrend() {
  const response = await api.get<DashboardSummaryResponse<BookingTrendPoint[]>>(
    "/dashboards/admin/booking-trend",
  );

  return response.data;
}

export async function getAdminRoomUsage() {
  const response = await api.get<DashboardSummaryResponse<RoomUsageItem[]>>(
    "/dashboards/admin/room-usage",
  );

  return response.data;
}

export async function getActivityLogs(params: ActivityLogListParams = {}) {
  const response = await api.get<ActivityLogListResponse>("/activity-logs", {
    params,
  });

  return response.data;
}
