import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: "primary" | "warning" | "success" | "neutral";
};

const toneClasses: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary:
    "bg-[color:var(--color-primary-container)] text-[color:var(--color-primary)]",
  warning:
    "bg-[color:var(--color-warning-container)] text-[color:var(--color-warning)]",
  success:
    "bg-[color:var(--color-success-container)] text-[color:var(--color-success)]",
  neutral:
    "bg-[color:var(--color-surface-subtle)] text-[color:var(--color-text-secondary)]",
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "primary",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-sm transition hover:shadow-md">
      <div
        className={`mb-4 flex size-10 items-center justify-center rounded-lg ${toneClasses[tone]}`}
      >
        <Icon className="size-5" />
      </div>
      <p className="text-sm font-semibold text-[color:var(--color-text-secondary)]">
        {title}
      </p>
      <p className="mt-1 text-3xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">
        {description}
      </p>
    </div>
  );
}
