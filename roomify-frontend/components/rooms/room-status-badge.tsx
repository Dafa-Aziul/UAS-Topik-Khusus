import type { RoomStatus } from "@/types/room";

type RoomStatusBadgeProps = {
  status: RoomStatus;
};

const statusMap = {
  AVAILABLE: {
    label: "Tersedia",
    className:
      "bg-[color:var(--color-success-container)] text-[color:var(--color-on-success-container)]",
  },
  MAINTENANCE: {
    label: "Maintenance",
    className:
      "bg-[color:var(--color-warning-container)] text-[color:var(--color-on-warning-container)]",
  },
  INACTIVE: {
    label: "Nonaktif",
    className:
      "bg-[color:var(--color-danger-container)] text-[color:var(--color-on-danger-container)]",
  },
};

export function RoomStatusBadge({ status }: RoomStatusBadgeProps) {
  const item = statusMap[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${item.className}`}
    >
      {item.label}
    </span>
  );
}
