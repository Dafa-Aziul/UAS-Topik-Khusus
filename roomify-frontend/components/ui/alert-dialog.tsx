"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type AlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  confirmVariant?: "default" | "destructive";
  isLoading?: boolean;
};

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  onConfirm,
  confirmVariant = "default",
  isLoading = false,
}: AlertDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[1.5rem] bg-white p-0">
        <DialogHeader className="border-b border-[color:var(--color-border)] px-6 py-5">
          <DialogTitle className="text-lg font-bold text-[color:var(--color-text-primary)]">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="rounded-b-[1.5rem] border-t border-[color:var(--color-border)] bg-white px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            className="rounded-xl"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
