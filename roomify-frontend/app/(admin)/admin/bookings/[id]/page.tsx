import { AdminBookingDetailClient } from "@/components/admin-bookings/admin-booking-detail-client";

type AdminBookingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminBookingDetailPage({
  params,
}: AdminBookingDetailPageProps) {
  const { id } = await params;

  return <AdminBookingDetailClient bookingId={id} />;
}
