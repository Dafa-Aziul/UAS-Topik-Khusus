"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveAdminBooking,
  completeAdminBooking,
  getAdminBookingDetail,
  getAdminBookings,
  rejectAdminBooking,
} from "@/lib/bookings";
import { roomKeys } from "@/hooks/use-rooms";
import type { BookingListParams } from "@/types/booking";

export const adminBookingKeys = {
  all: ["admin-bookings"] as const,
  list: (params: BookingListParams) =>
    ["admin-bookings", "list", params] as const,
  detail: (bookingId: string) =>
    ["admin-bookings", "detail", bookingId] as const,
};

export function useAdminBookings(params: BookingListParams) {
  return useQuery({
    queryKey: adminBookingKeys.list(params),
    queryFn: () => getAdminBookings(params),
  });
}

export function useAdminBookingDetail(bookingId: string) {
  return useQuery({
    queryKey: adminBookingKeys.detail(bookingId),
    queryFn: () => getAdminBookingDetail(bookingId),
    enabled: Boolean(bookingId),
  });
}

export function useApproveBookingMutation(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { admin_note?: string }) =>
      approveAdminBooking(bookingId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminBookingKeys.all });
      await queryClient.invalidateQueries({
        queryKey: adminBookingKeys.detail(bookingId),
      });
      await queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useRejectBookingMutation(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { admin_note: string }) =>
      rejectAdminBooking(bookingId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminBookingKeys.all });
      await queryClient.invalidateQueries({
        queryKey: adminBookingKeys.detail(bookingId),
      });
    },
  });
}

export function useCompleteBookingMutation(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => completeAdminBooking(bookingId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminBookingKeys.all });
      await queryClient.invalidateQueries({
        queryKey: adminBookingKeys.detail(bookingId),
      });
      await queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}
