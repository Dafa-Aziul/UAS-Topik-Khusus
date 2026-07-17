import { AdminRoomDetailClient } from "@/components/admin-rooms/admin-room-detail-client";

type AdminRoomDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminRoomDetailPage({
  params,
}: AdminRoomDetailPageProps) {
  const { id } = await params;

  return <AdminRoomDetailClient roomId={id} />;
}
