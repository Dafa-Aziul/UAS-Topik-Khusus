"use client";

import { CalendarDays, Clock3, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMyBookings } from "@/hooks/use-bookings";
import {
  formatIndonesianDate,
  formatTimeRangeLabel,
  getTodayInputValue,
} from "@/lib/date";
import type { BookingStatus } from "@/types/booking";

const bookingStatusOptions: Array<{
  label: string;
  value: BookingStatus | "";
}> = [
  { label: "Semua status", value: "" },
  { label: "Menunggu", value: "PENDING" },
  { label: "Disetujui", value: "APPROVED" },
  { label: "Ditolak", value: "REJECTED" },
  { label: "Dibatalkan", value: "CANCELLED" },
  { label: "Selesai", value: "COMPLETED" },
];

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function BookingListClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") as BookingStatus | "") ?? "";
  const dateFrom = searchParams.get("date_from") ?? "";
  const dateTo = searchParams.get("date_to") ?? "";
  const sort = searchParams.get("sort") ?? "-start_at";
  const page = parsePositiveInt(searchParams.get("page"), 1);

  const params = useMemo(
    () => ({
      status: status || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      sort,
      page,
      limit: 10,
    }),
    [dateFrom, dateTo, page, sort, status],
  );

  const bookingsQuery = useMyBookings(params);
  const bookings = bookingsQuery.data?.data ?? [];

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
        title="Peminjaman Saya"
        description="Pantau status pengajuan, lihat detail ruangan yang sudah Anda pesan, dan kelola booking yang masih bisa dibatalkan."
      />

      <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
            <span>Status</span>
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
                {bookingStatusOptions.map((option) => (
                  <SelectItem key={option.label} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
            <span>Tanggal mulai</span>
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
          </label>

          <label className="space-y-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
            <span>Tanggal akhir</span>
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
          </label>

          <div className="space-y-2 text-sm font-semibold text-[color:var(--color-text-primary)]">
            <span>Reset filter</span>
            <button
              type="button"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-white px-4 text-sm font-semibold text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-surface-subtle)]"
              onClick={() => {
                router.replace(pathname, { scroll: false });
              }}
            >
              Bersihkan Filter
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
              Riwayat Booking
            </h2>
            <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
              {bookingsQuery.data?.meta?.total_items ?? bookings.length} booking
              ditemukan
            </p>
          </div>
          <Link
            href={`/mahasiswa/rooms?date=${getTodayInputValue()}`}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--color-text-primary)] transition hover:bg-[color:var(--color-surface-subtle)] sm:w-auto"
          >
            <Search className="size-4" />
            Cari Ruangan Lagi
          </Link>
        </div>

        {bookingsQuery.isLoading ? <LoadingSkeleton lines={7} /> : null}

        {bookingsQuery.isError ? (
          <ErrorState
            description="Riwayat peminjaman Anda belum berhasil dimuat. Coba periksa koneksi Anda lalu muat ulang halaman."
            actionLabel="Coba Lagi"
            onAction={() => bookingsQuery.refetch()}
          />
        ) : null}

        {!bookingsQuery.isLoading && !bookingsQuery.isError && bookings.length === 0 ? (
          <EmptyState
            title="Belum ada peminjaman"
            description="Anda belum memiliki riwayat booking. Mulai dari halaman cari ruangan untuk membuat pengajuan pertama."
            actionLabel="Cari Ruangan"
            onAction={() => router.push("/mahasiswa/rooms")}
          />
        ) : null}

        {!bookingsQuery.isLoading && !bookingsQuery.isError && bookings.length > 0 ? (
          <div className="space-y-6">
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/mahasiswa/bookings/${booking.id}`}
                  className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm transition hover:border-[color:var(--color-primary)]/30 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                          {booking.booking_code}
                        </p>
                        <h3 className="mt-2 text-xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                          {booking.room_name ?? "Ruangan"}
                          {booking.room_code ? ` (${booking.room_code})` : ""}
                        </h3>
                      </div>

                      <div className="grid gap-3 text-sm text-[color:var(--color-text-secondary)] sm:grid-cols-2 sm:gap-4">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="size-4 text-[color:var(--color-primary)]" />
                          {formatIndonesianDate(booking.booking_date)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock3 className="size-4 text-[color:var(--color-primary)]" />
                          {formatTimeRangeLabel(booking.start_at, booking.end_at)} WIB
                        </span>
                      </div>

                      <p className="max-w-3xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
                        {booking.purpose}
                      </p>
                    </div>
                    <div className="flex w-full lg:w-auto">
                      <BookingStatusBadge status={booking.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <PaginationControls
              meta={bookingsQuery.data?.meta}
              onPageChange={(nextPage) =>
                updateQueryString({ page: nextPage <= 1 ? null : nextPage })
              }
            />
          </div>
        ) : null}
      </section>
    </div>
  );
}
