type StatusBadgeProps = {
  status: "PENDING" | "APPROVED" | "COMPLETED" | "REJECTED";
};

const statusMap = {
  PENDING: {
    label: "Menunggu Persetujuan",
    className:
      "bg-[color:var(--color-warning-container)] text-[color:var(--color-on-warning-container)]",
  },
  APPROVED: {
    label: "Disetujui",
    className:
      "bg-[color:var(--color-success-container)] text-[color:var(--color-on-success-container)]",
  },
  COMPLETED: {
    label: "Selesai",
    className:
      "bg-[color:var(--color-primary-container)] text-[color:var(--color-on-primary-container)]",
  },
  REJECTED: {
    label: "Ditolak",
    className:
      "bg-[color:var(--color-danger-container)] text-[color:var(--color-on-danger-container)]",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const item = statusMap[status];

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.className}`}
    >
      {item.label}
    </span>
  );
}
