"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminBookings } from "@/hooks/use-admin-bookings";
import { formatIndonesianDate, formatTimeRangeLabel } from "@/lib/date";
import type { BookingStatus } from "@/types/booking";

const statusOptions: Array<{ label: string; value: BookingStatus | "" }> = [
  { label: "Semua status", value: "" },
  { label: "Menunggu", value: "PENDING" },
  { label: "Disetujui", value: "APPROVED" },
  { label: "Ditolak", value: "REJECTED" },
  { label: "Dibatalkan", value: "CANCELLED" },
  { label: "Selesai", value: "COMPLETED" },
];

const statusTabs: Array<{ label: string; value: BookingStatus | "" }> = [
  { label: "Semua", value: "" },
  { label: "Menunggu", value: "PENDING" },
  { label: "Disetujui", value: "APPROVED" },
  { label: "Ditolak", value: "REJECTED" },
  { label: "Selesai", value: "COMPLETED" },
];

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function AdminBookingsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") as BookingStatus | "") ?? "";
  const userId = searchParams.get("user_id") ?? "";
  const roomId = searchParams.get("room_id") ?? "";
  const dateFrom = searchParams.get("date_from") ?? "";
  const dateTo = searchParams.get("date_to") ?? "";
  const sort = searchParams.get("sort") ?? "-start_at";
  const page = parsePositiveInt(searchParams.get("page"), 1);

  const params = useMemo(
    () => ({
      status: status || undefined,
      user_id: userId || undefined,
      room_id: roomId || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      sort,
      page,
      limit: 10,
    }),
    [dateFrom, dateTo, page, roomId, sort, status, userId],
  );

  const bookingsQuery = useAdminBookings(params);
  const bookings = bookingsQuery.data?.data ?? [];
  const bookingCount = bookingsQuery.data?.meta?.total_items ?? bookings.length;

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
        title="Daftar Permohonan Peminjaman"
        description="Pantau semua permohonan masuk, filter berdasarkan status, dan buka detail sebelum mengambil keputusan admin."
      />

      <section className="flex flex-wrap gap-2 rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-3 shadow-sm">
        {statusTabs.map((tab) => {
          const active = status === tab.value;

          return (
            <button
              key={tab.label}
              type="button"
              onClick={() =>
                updateQueryString({
                  status: tab.value || null,
                  page: null,
                })
              }
              className={
                active
                  ? "rounded-xl bg-[color:var(--color-surface-subtle)] px-4 py-2 text-sm font-semibold text-[color:var(--color-primary)]"
                  : "rounded-xl px-4 py-2 text-sm font-semibold text-[color:var(--color-text-secondary)] transition hover:bg-[color:var(--color-surface-subtle)] hover:text-[color:var(--color-text-primary)]"
              }
            >
              {tab.label}
            </button>
          );
        })}
      </section>

      <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-text-muted)]" />
            <Input
              value={userId}
              onChange={(event) =>
                updateQueryString({
                  user_id: event.target.value || null,
                  page: null,
                })
              }
              placeholder="Filter user_id booking"
              className="h-11 rounded-xl pl-11"
            />
          </div>

          <Input
            value={roomId}
            onChange={(event) =>
              updateQueryString({
                room_id: event.target.value || null,
                page: null,
              })
            }
            placeholder="Filter room_id"
            className="h-11 rounded-xl"
          />

          <Select
            value={status}
            onValueChange={(value) =>
              updateQueryString({
                status: value || null,
                page: null,
              })
            }
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-[color:var(--color-border)] bg-white px-3 text-sm">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.label} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="grid gap-4 md:col-span-2 xl:col-span-5 xl:grid-cols-[1fr_1fr_auto]">
            <Input
              type="date"
              value={dateFrom}
              max={dateTo || undefined}
              className="h-11 rounded-xl"
              onChange={(event) =>
                updateQueryString({
                  date_from: event.target.value || null,
                  page: null,
                })
              }
            />
            <Input
              type="date"
              value={dateTo}
              min={dateFrom || undefined}
              className="h-11 rounded-xl"
              onChange={(event) =>
                updateQueryString({
                  date_to: event.target.value || null,
                  page: null,
                })
              }
            />
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-white px-4 text-sm font-semibold text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-surface-subtle)]"
              onClick={() => router.replace(pathname, { scroll: false })}
            >
              Bersihkan
            </button>
          </div>
        </div>
      </section>

      {bookingsQuery.isLoading ? <LoadingSkeleton lines={8} /> : null}

      {bookingsQuery.isError ? (
        <ErrorState
          description="Daftar permohonan admin belum berhasil dimuat."
          actionLabel="Coba Lagi"
          onAction={() => bookingsQuery.refetch()}
        />
      ) : null}

      {!bookingsQuery.isLoading && !bookingsQuery.isError && bookings.length === 0 ? (
        <EmptyState
          title="Belum ada permohonan"
          description="Tidak ada booking yang cocok dengan filter saat ini."
        />
      ) : null}

      {!bookingsQuery.isLoading && !bookingsQuery.isError && bookings.length > 0 ? (
        <section className="space-y-5 overflow-hidden rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                Permohonan Masuk
              </h2>
              <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                {bookingCount} booking ditemukan
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:hidden">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-[1.25rem] border border-[color:var(--color-border)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-primary)]">
                      {booking.booking_code}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-[color:var(--color-text-primary)]">
                      {booking.user_name ?? booking.user_email ?? booking.user_id}
                    </h3>
                    <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                      {booking.room_name ?? booking.room_id}
                    </p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>

                <div className="mt-4 space-y-2 text-sm text-[color:var(--color-text-secondary)]">
                  <p>{formatIndonesianDate(booking.booking_date)}</p>
                  <p>{formatTimeRangeLabel(booking.start_at, booking.end_at)} WIB</p>
                  <p>{booking.user_nim ?? booking.user_email ?? "-"}</p>
                </div>

                <div className="mt-4">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-surface-subtle)]"
                  >
                    Periksa
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="min-w-full text-left">
              <thead className="bg-[color:var(--color-surface-subtle)]">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Kode
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Mahasiswa
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Ruangan
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Jadwal
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Status
                  </th>
                  <th className="px-5 py-4 text-right text-sm font-semibold text-[color:var(--color-text-secondary)]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-t border-[color:var(--color-border)]"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-[color:var(--color-primary)]">
                      {booking.booking_code}
                    </td>
                    <td className="px-5 py-4 text-sm text-[color:var(--color-text-primary)]">
                      <p className="font-semibold">
                        {booking.user_name ?? booking.user_email ?? booking.user_id}
                      </p>
                      <p className="text-[color:var(--color-text-secondary)]">
                        {booking.user_nim ?? booking.user_email ?? "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-[color:var(--color-text-primary)]">
                      <p className="font-semibold">
                        {booking.room_name ?? booking.room_id}
                      </p>
                      <p className="text-[color:var(--color-text-secondary)]">
                        {booking.room_code ?? "-"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-[color:var(--color-text-secondary)]">
                      <p>{formatIndonesianDate(booking.booking_date)}</p>
                      <p>
                        {formatTimeRangeLabel(booking.start_at, booking.end_at)} WIB
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="inline-flex rounded-xl border border-[color:var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-surface-subtle)]"
                      >
                        Periksa
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <PaginationControls
            meta={bookingsQuery.data?.meta}
            onPageChange={(nextPage) =>
              updateQueryString({ page: nextPage <= 1 ? null : nextPage })
            }
          />
        </section>
      ) : null}
    </div>
  );
}
