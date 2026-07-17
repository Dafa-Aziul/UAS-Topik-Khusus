import { AuthGuard } from "@/components/auth/auth-guard";
import { BookingDetailClient } from "@/components/bookings/booking-detail-client";

type MahasiswaBookingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MahasiswaBookingDetailPage({
  params,
}: MahasiswaBookingDetailPageProps) {
  const { id } = await params;

  return (
    <AuthGuard allowedRoles={["MAHASISWA"]}>
      <BookingDetailClient bookingId={id} />
    </AuthGuard>
  );
}
