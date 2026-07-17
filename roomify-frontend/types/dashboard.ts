export type MahasiswaDashboardSummary = {
  total_bookings: number;
  pending_bookings: number;
  approved_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
};

export type AdminDashboardBookingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type AdminDashboardSummary = {
  total_active_students: number;
  total_rooms: number;
  booking_status_summary: Partial<Record<AdminDashboardBookingStatus, number>>;
};

export type BookingTrendPoint = {
  booking_date: string;
  total_bookings: number;
};

export type RoomUsageItem = {
  room_id: string;
  room_name: string;
  total_bookings: number;
};

export type ActivityLog = {
  id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  request_id: string | null;
  created_at: string;
};

export type ActivityLogListParams = {
  actor_id?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
  page?: number;
  limit?: number;
};
