export type RoomStatus = "AVAILABLE" | "MAINTENANCE" | "INACTIVE";

export type AvailabilitySlot = {
  start_at: string;
  end_at: string;
  booking_id?: string | null;
};

export type Room = {
  id: string;
  code: string;
  name: string;
  building: string;
  floor: number;
  location_description: string;
  capacity: number;
  facilities: string[];
  description: string;
  image_url: string | null;
  status: RoomStatus;
};

export type RoomAvailability = {
  room_id: string;
  date: string;
  room_status: RoomStatus;
  is_bookable: boolean;
  blocked_slots: AvailabilitySlot[];
};

export type RoomListParams = {
  search?: string;
  building?: string;
  status?: RoomStatus | "";
  min_capacity?: number;
  facility?: string[];
  page?: number;
  limit?: number;
  sort?: string;
};
