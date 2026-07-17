import { api } from "@/lib/axios";
import type { ApiEnvelope, ApiMeta } from "@/types/api";
import type { Booking, BookingListParams } from "@/types/booking";

export type CreateBookingPayload = {
  room_id: string;
  purpose: string;
  participant_count: number;
  start_at: string;
  end_at: string;
  user_note?: string;
};

export type BookingResponse = ApiEnvelope<{
  id: string;
  booking_code: string;
  user_id: string;
  room_id: string;
  purpose: string;
  participant_count: number;
  booking_date: string;
  start_at: string;
  end_at: string;
  status: string;
  user_note: string | null;
  admin_note: string | null;
}>;

type BookingApiModel = Omit<Booking, "id"> & {
  id?: string;
  _id?: string;
  user?: {
    id?: string;
    name?: string | null;
    nim?: string | null;
    email?: string | null;
    role?: string | null;
  } | null;
  room?: {
    id?: string;
    code?: string | null;
    name?: string | null;
    building?: string | null;
    floor?: number | null;
    location_description?: string | null;
    capacity?: number | null;
    facilities?: string[] | null;
    description?: string | null;
    image_url?: string | null;
    status?: string | null;
  } | null;
};

type BookingListResponse = ApiEnvelope<BookingApiModel[], ApiMeta>;
type BookingDetailResponse = ApiEnvelope<BookingApiModel>;
type CancelBookingResponse = ApiEnvelope<{
  id: string;
  status: string;
  cancelled_by: string;
  cancelled_at: string;
}>;
type AdminDecisionPayload = {
  admin_note?: string;
};

function normalizeBooking(booking: BookingApiModel): Booking {
  return {
    ...booking,
    id: booking.id ?? booking._id ?? "",
    user_id: booking.user_id ?? booking.user?.id ?? "",
    room_id: booking.room_id ?? booking.room?.id ?? "",
    user_name: booking.user_name ?? booking.user?.name ?? null,
    user_nim: booking.user_nim ?? booking.user?.nim ?? null,
    user_email: booking.user_email ?? booking.user?.email ?? null,
    room_name: booking.room_name ?? booking.room?.name ?? null,
    room_code: booking.room_code ?? booking.room?.code ?? null,
    room_building: booking.room_building ?? booking.room?.building ?? null,
    room_floor: booking.room_floor ?? booking.room?.floor ?? null,
    room_capacity: booking.room_capacity ?? booking.room?.capacity ?? null,
    room_description: booking.room_description ?? booking.room?.description ?? null,
    room_image_url: booking.room_image_url ?? booking.room?.image_url ?? null,
    room_status:
      booking.room_status ??
      ((booking.room?.status as Booking["room_status"]) ?? null),
    room_facilities: booking.room_facilities ?? booking.room?.facilities ?? null,
    room_location_description:
      booking.room_location_description ??
      booking.room?.location_description ??
      null,
  };
}

export async function createBooking(payload: CreateBookingPayload) {
  const response = await api.post<BookingResponse>("/bookings", payload);
  return response.data;
}

export async function getMyBookings(params: BookingListParams = {}) {
  const response = await api.get<BookingListResponse>("/bookings/me", { params });

  return {
    ...response.data,
    data: response.data.data.map(normalizeBooking),
  } satisfies ApiEnvelope<Booking[], ApiMeta>;
}

export async function getMyBookingDetail(bookingId: string) {
  const response = await api.get<BookingDetailResponse>(`/bookings/${bookingId}`);

  return {
    ...response.data,
    data: normalizeBooking(response.data.data),
  } satisfies ApiEnvelope<Booking>;
}

export async function cancelMyBooking(bookingId: string) {
  const response = await api.patch<CancelBookingResponse>(
    `/bookings/${bookingId}/cancel`,
  );

  return response.data;
}

export async function getAdminBookings(params: BookingListParams = {}) {
  const response = await api.get<BookingListResponse>("/admin/bookings", {
    params,
  });

  return {
    ...response.data,
    data: response.data.data.map(normalizeBooking),
  } satisfies ApiEnvelope<Booking[], ApiMeta>;
}

export async function getAdminBookingDetail(bookingId: string) {
  const response = await api.get<BookingDetailResponse>(
    `/admin/bookings/${bookingId}`,
  );

  return {
    ...response.data,
    data: normalizeBooking(response.data.data),
  } satisfies ApiEnvelope<Booking>;
}

export async function approveAdminBooking(
  bookingId: string,
  payload: AdminDecisionPayload,
) {
  const response = await api.patch<BookingDetailResponse>(
    `/admin/bookings/${bookingId}/approve`,
    payload,
  );

  return {
    ...response.data,
    data: normalizeBooking(response.data.data),
  } satisfies ApiEnvelope<Booking>;
}

export async function rejectAdminBooking(
  bookingId: string,
  payload: Required<AdminDecisionPayload>,
) {
  const response = await api.patch<BookingDetailResponse>(
    `/admin/bookings/${bookingId}/reject`,
    payload,
  );

  return {
    ...response.data,
    data: normalizeBooking(response.data.data),
  } satisfies ApiEnvelope<Booking>;
}

export async function completeAdminBooking(bookingId: string) {
  const response = await api.patch<BookingDetailResponse>(
    `/admin/bookings/${bookingId}/complete`,
  );

  return {
    ...response.data,
    data: normalizeBooking(response.data.data),
  } satisfies ApiEnvelope<Booking>;
}
