import { AdminRoomFormClient } from "@/components/admin-rooms/admin-room-form-client";

type AdminRoomEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminRoomEditPage({
  params,
}: AdminRoomEditPageProps) {
  const { id } = await params;

  return <AdminRoomFormClient mode="edit" roomId={id} />;
}
