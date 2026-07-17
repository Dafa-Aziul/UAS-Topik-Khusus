"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createRoom,
  deactivateRoom,
  updateRoom,
  updateRoomStatus,
  type RoomMutationPayload,
} from "@/lib/rooms";
import { roomKeys } from "@/hooks/use-rooms";
import type { RoomStatus } from "@/types/room";

export function useCreateRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RoomMutationPayload) => createRoom(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roomKeys.all });
    },
  });
}

export function useUpdateRoomMutation(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<RoomMutationPayload>) =>
      updateRoom(roomId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roomKeys.all });
      await queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
    },
  });
}

export function useUpdateRoomStatusMutation(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: RoomStatus) => updateRoomStatus(roomId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roomKeys.all });
      await queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
    },
  });
}

export function useDeactivateRoomMutation(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deactivateRoom(roomId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roomKeys.all });
      await queryClient.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
    },
  });
}
