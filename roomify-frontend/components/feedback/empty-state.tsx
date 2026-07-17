import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-8 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[color:var(--color-surface-subtle)] text-[color:var(--color-primary)]">
        <Inbox className="size-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[color:var(--color-text-primary)]">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
        {description}
      </p>
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction} type="button">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
