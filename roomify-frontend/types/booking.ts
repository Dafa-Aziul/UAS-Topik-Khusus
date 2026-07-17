export type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type Booking = {
  id: string;
  booking_code: string;
  user_id: string;
  room_id: string;
  purpose: string;
  participant_count: number;
  booking_date: string;
  start_at: string;
  end_at: string;
  status: BookingStatus;
  user_note: string | null;
  admin_note: string | null;
  room_name?: string | null;
  room_code?: string | null;
  user_name?: string | null;
  user_nim?: string | null;
  user_email?: string | null;
  room_building?: string | null;
  room_floor?: number | null;
  room_location_description?: string | null;
  room_capacity?: number | null;
  room_description?: string | null;
  room_image_url?: string | null;
  room_status?: "AVAILABLE" | "MAINTENANCE" | "INACTIVE" | null;
  room_facilities?: string[] | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  completed_by?: string | null;
  completed_at?: string | null;
  cancelled_by?: string | null;
  cancelled_at?: string | null;
};

export type BookingListParams = {
  status?: BookingStatus | "";
  room_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  sort?: string;
};
