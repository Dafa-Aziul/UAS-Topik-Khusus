type LoadingSkeletonProps = {
  lines?: number;
  showHeader?: boolean;
};

export function LoadingSkeleton({
  lines = 3,
  showHeader = true,
}: LoadingSkeletonProps) {
  return (
    <div className="animate-pulse rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
      {showHeader ? (
        <div className="mb-6 space-y-3">
          <div className="h-7 w-56 rounded-full bg-[color:var(--color-surface-subtle)]" />
          <div className="h-4 w-80 max-w-full rounded-full bg-[color:var(--color-surface-subtle)]" />
        </div>
      ) : null}

      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-4 rounded-full bg-[color:var(--color-surface-subtle)]"
            style={{ width: `${100 - index * 8}%` }}
          />
        ))}
      </div>
    </div>
  );
}
