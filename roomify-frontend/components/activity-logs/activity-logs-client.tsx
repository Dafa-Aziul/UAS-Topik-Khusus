"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { useActivityLogs } from "@/hooks/use-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatIndonesianDate, formatTimeLabel } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { ActivityLog } from "@/types/dashboard";

const actionOptions = [
  "",
  "BOOKING_APPROVED",
  "BOOKING_REJECTED",
  "BOOKING_COMPLETED",
  "ROOM_CREATED",
  "ROOM_UPDATED",
  "ROOM_STATUS_UPDATED",
  "ROOM_DELETED",
];

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getActionTone(action: string) {
  if (action.includes("APPROVED") || action.includes("COMPLETED")) {
    return "bg-[color:var(--color-success-container)] text-[color:var(--color-success)]";
  }

  if (action.includes("REJECTED") || action.includes("DELETED")) {
    return "bg-[color:var(--color-danger-container)] text-[color:var(--color-danger)]";
  }

  return "bg-[color:var(--color-primary-container)] text-[color:var(--color-primary)]";
}

export function ActivityLogsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);

  const actorId = searchParams.get("actor_id") ?? "";
  const action = searchParams.get("action") ?? "";
  const entityType = searchParams.get("entity_type") ?? "";
  const entityId = searchParams.get("entity_id") ?? "";
  const page = parsePositiveInt(searchParams.get("page"), 1);

  const params = useMemo(
    () => ({
      actor_id: actorId || undefined,
      action: action || undefined,
      entity_type: entityType || undefined,
      entity_id: entityId || undefined,
      page,
      limit: 10,
    }),
    [action, actorId, entityId, entityType, page],
  );

  const logsQuery = useActivityLogs(params);
  const logs = logsQuery.data?.data ?? [];

  const updateQueryString = (
    updates: Record<string, string | number | null | undefined>,
  ) => {
    const nextParams = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      nextParams.delete(key);

      if (value !== null && value !== undefined && value !== "") {
        nextParams.set(key, String(value));
      }
    });

    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity Log"
        description="Telusuri aktivitas penting di Roomify, filter berdasarkan aktor atau entitas, lalu buka detail log untuk metadata dan request ID."
      />

      <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-text-muted)]" />
            <Input
              value={actorId}
              onChange={(event) =>
                updateQueryString({
                  actor_id: event.target.value || null,
                  page: null,
                })
              }
              placeholder="Filter actor_id"
              className="h-11 rounded-xl pl-11"
            />
          </div>

          <Select
            value={action}
            onValueChange={(value) =>
              updateQueryString({
                action: value || null,
                page: null,
              })
            }
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-[color:var(--color-border)] bg-white px-3 text-sm">
              <SelectValue placeholder="Semua aksi" />
            </SelectTrigger>
            <SelectContent>
              {actionOptions.map((option) => (
                <SelectItem key={option || "all"} value={option}>
                  {option || "Semua aksi"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={entityType}
            onChange={(event) =>
              updateQueryString({
                entity_type: event.target.value || null,
                page: null,
              })
            }
            placeholder="Filter entity_type"
            className="h-11 rounded-xl"
          />

          <Input
            value={entityId}
            onChange={(event) =>
              updateQueryString({
                entity_id: event.target.value || null,
                page: null,
              })
            }
            placeholder="Filter entity_id"
            className="h-11 rounded-xl"
          />

          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-white px-4 text-sm font-semibold text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-surface-subtle)]"
            onClick={() => router.replace(pathname, { scroll: false })}
          >
            Bersihkan
          </button>
        </div>
      </section>

      {logsQuery.isLoading ? <LoadingSkeleton lines={8} /> : null}

      {logsQuery.isError ? (
        <ErrorState
          description="Data activity log belum berhasil dimuat. Coba periksa koneksi Anda lalu muat ulang halaman."
          actionLabel="Coba Lagi"
          onAction={() => logsQuery.refetch()}
        />
      ) : null}

      {!logsQuery.isLoading && !logsQuery.isError && logs.length === 0 ? (
        <EmptyState
          title="Belum ada activity log"
          description="Tidak ada log yang cocok dengan filter yang sedang dipakai."
        />
      ) : null}

      {!logsQuery.isLoading && !logsQuery.isError && logs.length > 0 ? (
        <section className="space-y-5 overflow-hidden rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[color:var(--color-surface-subtle)]">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Waktu
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Aksi
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Entitas
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Deskripsi
                  </th>
                  <th className="px-5 py-4 text-right text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Detail
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-[color:var(--color-border)]"
                  >
                    <td className="px-5 py-4 text-sm text-[color:var(--color-text-secondary)]">
                      <p>{formatIndonesianDate(log.created_at)}</p>
                      <p>{formatTimeLabel(log.created_at)} WIB</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                          getActionTone(log.action),
                        )}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[color:var(--color-text-primary)]">
                      <p className="font-semibold">{log.entity_type}</p>
                      <p className="text-[color:var(--color-text-secondary)]">
                        {log.entity_id}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-[color:var(--color-text-secondary)]">
                      {log.description}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex rounded-xl border border-[color:var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-surface-subtle)]"
                      >
                        Lihat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls
            meta={logsQuery.data?.meta}
            onPageChange={(nextPage) =>
              updateQueryString({ page: nextPage <= 1 ? null : nextPage })
            }
          />
        </section>
      ) : null}

      <Dialog
        open={Boolean(selectedLog)}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      >
        <DialogContent className="max-w-2xl rounded-[1.5rem] bg-white p-0">
          {selectedLog ? (
            <>
              <DialogHeader className="border-b border-[color:var(--color-border)] px-6 py-5">
                <DialogTitle className="text-xl font-bold text-[color:var(--color-text-primary)]">
                  Detail Activity Log
                </DialogTitle>
                <DialogDescription className="text-sm text-[color:var(--color-text-secondary)]">
                  Buka metadata event dan request ID untuk kebutuhan audit atau debugging.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 px-6 py-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-[color:var(--color-surface-subtle)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                      Aktor
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
                      {selectedLog.actor_id}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                      Role: {selectedLog.actor_role}
                    </p>
                  </div>

                  <div className="rounded-xl bg-[color:var(--color-surface-subtle)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                      Request ID
                    </p>
                    <p className="mt-2 break-all text-sm font-semibold text-[color:var(--color-text-primary)]">
                      {selectedLog.request_id ?? "-"}
                    </p>
                    <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                      IP: {selectedLog.ip_address ?? "-"}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                      Aksi
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
                      {selectedLog.action}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                      Waktu
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
                      {formatIndonesianDate(selectedLog.created_at)} -{" "}
                      {formatTimeLabel(selectedLog.created_at)} WIB
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                    Deskripsi
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {selectedLog.description}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                    Metadata
                  </p>
                  <pre className="mt-2 overflow-x-auto rounded-xl bg-[color:var(--color-surface-subtle)] p-4 text-xs leading-6 text-[color:var(--color-text-primary)]">
                    {JSON.stringify(selectedLog.metadata ?? {}, null, 2)}
                  </pre>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
