import { AuthGuard } from "@/components/auth/auth-guard";
import { RoomDetailClient } from "@/components/rooms/room-detail-client";

type RoomDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RoomDetailPage({
  params,
}: RoomDetailPageProps) {
  const { id } = await params;

  return (
    <AuthGuard allowedRoles={["MAHASISWA"]}>
      <RoomDetailClient roomId={id} />
    </AuthGuard>
  );
}
