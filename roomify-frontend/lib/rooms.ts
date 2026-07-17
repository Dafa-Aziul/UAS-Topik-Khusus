import { api } from "@/lib/axios";
import type { ApiEnvelope, ApiMeta } from "@/types/api";
import type {
  Room,
  RoomAvailability,
  RoomListParams,
  RoomStatus,
} from "@/types/room";

export type RoomListResponse = ApiEnvelope<Room[], ApiMeta>;
export type RoomDetailResponse = ApiEnvelope<Room>;
export type RoomAvailabilityResponse = ApiEnvelope<RoomAvailability>;
export type RoomMutationPayload = {
  code: string;
  name: string;
  building: string;
  floor: number;
  location_description: string;
  capacity: number;
  facilities: string[];
  description: string;
  status: RoomStatus;
  image_file?: File | null;
  remove_image?: boolean;
};

type RoomApiModel = Omit<Room, "id"> & {
  id?: string;
  _id?: string;
};

type RoomListApiResponse = ApiEnvelope<RoomApiModel[], ApiMeta>;
type RoomDetailApiResponse = ApiEnvelope<RoomApiModel>;

function normalizeRoom(room: RoomApiModel): Room {
  return {
    ...room,
    id: room.id ?? room._id ?? "",
  };
}

function buildRoomFormData(payload: Partial<RoomMutationPayload>) {
  const formData = new FormData();

  if (payload.code !== undefined) {
    formData.append("code", payload.code);
  }

  if (payload.name !== undefined) {
    formData.append("name", payload.name);
  }

  if (payload.building !== undefined) {
    formData.append("building", payload.building);
  }

  if (payload.floor !== undefined) {
    formData.append("floor", String(payload.floor));
  }

  if (payload.location_description !== undefined) {
    formData.append("location_description", payload.location_description);
  }

  if (payload.capacity !== undefined) {
    formData.append("capacity", String(payload.capacity));
  }

  if (payload.description !== undefined) {
    formData.append("description", payload.description);
  }

  if (payload.status !== undefined) {
    formData.append("status", payload.status);
  }

  if (payload.facilities !== undefined) {
    payload.facilities.forEach((facility) => {
      formData.append("facilities", facility);
    });
  }

  if (payload.image_file) {
    formData.append("image_file", payload.image_file, payload.image_file.name);
  }

  if (payload.remove_image === true) {
    formData.append("remove_image", "true");
  }

  return formData;
}

export async function getRooms(params: RoomListParams = {}) {
  const response = await api.get<RoomListApiResponse>("/rooms", { params });

  return {
    ...response.data,
    data: response.data.data.map(normalizeRoom),
  } satisfies RoomListResponse;
}

export async function getRoomDetail(roomId: string) {
  const response = await api.get<RoomDetailApiResponse>(`/rooms/${roomId}`);

  return {
    ...response.data,
    data: normalizeRoom(response.data.data),
  } satisfies RoomDetailResponse;
}

export async function getRoomAvailability(roomId: string, date: string) {
  const response = await api.get<RoomAvailabilityResponse>(
    `/rooms/${roomId}/availability`,
    {
      params: { date },
    },
  );

  return response.data;
}

export async function createRoom(payload: RoomMutationPayload) {
  const response = await api.post<RoomDetailApiResponse>(
    "/admin/rooms",
    buildRoomFormData(payload),
  );

  return {
    ...response.data,
    data: normalizeRoom(response.data.data),
  } satisfies RoomDetailResponse;
}

export async function updateRoom(
  roomId: string,
  payload: Partial<RoomMutationPayload>,
) {
  const response = await api.patch<RoomDetailApiResponse>(
    `/admin/rooms/${roomId}`,
    buildRoomFormData(payload),
  );

  return {
    ...response.data,
    data: normalizeRoom(response.data.data),
  } satisfies RoomDetailResponse;
}

export async function updateRoomStatus(roomId: string, status: RoomStatus) {
  const response = await api.patch<RoomDetailApiResponse>(
    `/admin/rooms/${roomId}/status`,
    { status },
  );

  return {
    ...response.data,
    data: normalizeRoom(response.data.data),
  } satisfies RoomDetailResponse;
}

export async function deactivateRoom(roomId: string) {
  const response = await api.delete<ApiEnvelope<null>>(`/admin/rooms/${roomId}`);
  return response.data;
}
