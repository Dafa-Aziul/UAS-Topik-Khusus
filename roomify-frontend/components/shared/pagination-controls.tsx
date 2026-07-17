"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ApiMeta } from "@/types/api";

type PaginationControlsProps = {
  meta?: ApiMeta | null;
  onPageChange: (page: number) => void;
  className?: string;
};

export function PaginationControls({
  meta,
  onPageChange,
  className,
}: PaginationControlsProps) {
  if (!meta || meta.total_pages <= 1) {
    return null;
  }

  return (
    <div
      className={className ?? "flex flex-col gap-3 border-t border-[color:var(--color-border)] pt-5 sm:flex-row sm:items-center sm:justify-between"}
    >
      <div className="text-sm text-[color:var(--color-text-secondary)]">
        Halaman {meta.page} dari {meta.total_pages} • {meta.total_items} data
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          disabled={!meta.has_previous}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="size-4" />
          Sebelumnya
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl"
          disabled={!meta.has_next}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Berikutnya
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
