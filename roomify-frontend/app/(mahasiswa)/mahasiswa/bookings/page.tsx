import { AuthGuard } from "@/components/auth/auth-guard";
import { BookingListClient } from "@/components/bookings/booking-list-client";

export default function MahasiswaBookingsPage() {
  return (
    <AuthGuard allowedRoles={["MAHASISWA"]}>
      <BookingListClient />
    </AuthGuard>
  );
}
