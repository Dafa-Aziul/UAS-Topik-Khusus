import { AuthGuard } from "@/components/auth/auth-guard";
import { RoomsClient } from "@/components/rooms/rooms-client";

export default function MahasiswaRoomsPage() {
  return (
    <AuthGuard allowedRoles={["MAHASISWA"]}>
      <RoomsClient />
    </AuthGuard>
  );
}
