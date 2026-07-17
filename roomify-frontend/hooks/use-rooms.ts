"use client";

import { useQuery } from "@tanstack/react-query";

import { getRoomAvailability, getRoomDetail, getRooms } from "@/lib/rooms";
import type { RoomListParams } from "@/types/room";

export const roomKeys = {
  all: ["rooms"] as const,
  list: (params: RoomListParams) => ["rooms", "list", params] as const,
  detail: (roomId: string) => ["rooms", "detail", roomId] as const,
  availability: (roomId: string, date: string) =>
    ["rooms", "availability", roomId, date] as const,
};

export function useRooms(params: RoomListParams) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => getRooms(params),
  });
}

export function useRoomDetail(roomId: string) {
  return useQuery({
    queryKey: roomKeys.detail(roomId),
    queryFn: () => getRoomDetail(roomId),
    enabled: Boolean(roomId),
  });
}

export function useRoomAvailability(roomId: string, date: string) {
  return useQuery({
    queryKey: roomKeys.availability(roomId, date),
    queryFn: () => getRoomAvailability(roomId, date),
    enabled: Boolean(roomId && date),
  });
}
