"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelMyBooking,
  createBooking,
  getMyBookingDetail,
  getMyBookings,
  type CreateBookingPayload,
} from "@/lib/bookings";
import type { BookingListParams } from "@/types/booking";

export const bookingKeys = {
  all: ["bookings"] as const,
  mine: (params: BookingListParams) => ["bookings", "me", params] as const,
  detail: (bookingId: string) => ["bookings", "detail", bookingId] as const,
};

export function useCreateBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    },
  });
}

export function useMyBookings(params: BookingListParams) {
  return useQuery({
    queryKey: bookingKeys.mine(params),
    queryFn: () => getMyBookings(params),
  });
}

export function useMyBookingDetail(bookingId: string) {
  return useQuery({
    queryKey: bookingKeys.detail(bookingId),
    queryFn: () => getMyBookingDetail(bookingId),
    enabled: Boolean(bookingId),
  });
}

export function useCancelBookingMutation(bookingId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cancelMyBooking(bookingId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      await queryClient.invalidateQueries({
        queryKey: bookingKeys.detail(bookingId),
      });
    },
  });
}
