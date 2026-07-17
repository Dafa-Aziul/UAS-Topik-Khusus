import { BookingFormClient } from "@/components/bookings/booking-form-client";

type BookingCreatePageProps = {
  searchParams: Promise<{
    roomId?: string;
    date?: string;
  }>;
};

export default async function BookingCreatePage({
  searchParams,
}: BookingCreatePageProps) {
  const params = await searchParams;

  return (
    <BookingFormClient
      roomId={params.roomId ?? null}
      initialDate={params.date ?? null}
    />
  );
}
