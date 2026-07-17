import type { BookingStatus } from "@/types/booking";

type BookingStatusBadgeProps = {
  status: BookingStatus;
};

const statusMap: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Menunggu",
    className:
      "bg-[color:var(--color-warning-container)] text-[color:var(--color-on-warning-container)]",
  },
  APPROVED: {
    label: "Disetujui",
    className:
      "bg-[color:var(--color-success-container)] text-[color:var(--color-on-success-container)]",
  },
  REJECTED: {
    label: "Ditolak",
    className:
      "bg-[color:var(--color-danger-container)] text-[color:var(--color-on-danger-container)]",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className:
      "bg-[color:var(--color-surface-subtle)] text-[color:var(--color-text-secondary)]",
  },
  COMPLETED: {
    label: "Selesai",
    className:
      "bg-[color:var(--color-accent)] text-[color:var(--color-primary)]",
  },
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const item = statusMap[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${item.className}`}
    >
      {item.label}
    </span>
  );
}
