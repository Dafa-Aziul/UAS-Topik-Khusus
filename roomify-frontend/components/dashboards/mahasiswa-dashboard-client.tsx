"use client";

import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Search,
  Shapes,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { StatCard } from "@/components/dashboards/stat-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { useMahasiswaDashboard } from "@/hooks/use-dashboard";
import { useMyBookings } from "@/hooks/use-bookings";
import {
  formatIndonesianDate,
  formatTimeRangeLabel,
  getTodayInputValue,
} from "@/lib/date";

const TODAY_REFERENCE_TIMESTAMP = new Date(
  `${getTodayInputValue()}T00:00:00+07:00`,
).getTime();

function getBookingTimestamp(value: string) {
  return new Date(value).getTime();
}

export function MahasiswaDashboardClient() {
  const dashboardQuery = useMahasiswaDashboard();
  const bookingsQuery = useMyBookings({
    page: 1,
    limit: 5,
    sort: "-start_at",
  });

  const summary = dashboardQuery.data?.data;
  const bookingsData = bookingsQuery.data?.data;
  const bookings = useMemo(() => bookingsData ?? [], [bookingsData]);
  const isLoading = dashboardQuery.isLoading || bookingsQuery.isLoading;
  const hasError = dashboardQuery.isError || bookingsQuery.isError;

  const approvedUpcomingBooking = useMemo(() => {
    return [...bookings]
      .filter(
        (booking) =>
          booking.status === "APPROVED" &&
          getBookingTimestamp(booking.start_at) >= TODAY_REFERENCE_TIMESTAMP,
      )
      .sort(
        (left, right) =>
          getBookingTimestamp(left.start_at) - getBookingTimestamp(right.start_at),
      )[0];
  }, [bookings]);

  const latestBooking = bookings[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Mahasiswa"
        description="Temukan ruangan yang tersedia, pantau status pengajuan, dan kelola agenda peminjaman Anda dari satu halaman yang ringkas."
      />

      <section className="overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#2563eb_0%,#1d4ed8_55%,#0f172a_100%)] p-6 text-white shadow-lg sm:rounded-[1.75rem] sm:p-8">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.24em] text-blue-100">
            Mahasiswa Dashboard
          </p>
          <h3 className="mt-3 text-[2rem] font-bold tracking-[-0.03em] sm:text-4xl">
            Semua booking Anda dalam satu ringkasan.
          </h3>
          <p className="mt-4 text-[15px] leading-7 text-blue-50/90 sm:text-base sm:leading-8">
            Gunakan dashboard ini untuk mengecek pengajuan aktif, melihat jadwal
            terdekat, dan langsung lanjut mencari ruangan baru.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
            <Link
              href={`/mahasiswa/rooms?date=${getTodayInputValue()}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[color:var(--color-primary)] transition hover:bg-blue-50"
            >
              <Search className="size-4 text-[color:var(--color-primary)]" />
              <span className="text-[color:var(--color-primary)]">
                Cari Ruangan
              </span>
            </Link>
            <Link
              href="/mahasiswa/bookings"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              <CalendarClock className="size-4" />
              Lihat Peminjaman Saya
            </Link>
          </div>
        </div>
      </section>

      {isLoading ? <LoadingSkeleton lines={8} /> : null}

      {hasError ? (
        <ErrorState
          description="Dashboard mahasiswa belum berhasil dimuat. Coba periksa koneksi Anda lalu muat ulang halaman."
          actionLabel="Coba Lagi"
          onAction={() => {
            void dashboardQuery.refetch();
            void bookingsQuery.refetch();
          }}
        />
      ) : null}

      {!isLoading && !hasError && summary ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Peminjaman"
              value={String(summary.total_bookings)}
              description="Semua riwayat booking yang pernah Anda buat."
              icon={Shapes}
              tone="primary"
            />
            <StatCard
              title="Menunggu"
              value={String(summary.pending_bookings)}
              description="Pengajuan yang masih menunggu verifikasi admin."
              icon={Clock3}
              tone="warning"
            />
            <StatCard
              title="Disetujui"
              value={String(summary.approved_bookings)}
              description="Booking aktif yang siap digunakan sesuai jadwal."
              icon={CheckCircle2}
              tone="success"
            />
            <StatCard
              title="Selesai"
              value={String(summary.completed_bookings)}
              description="Peminjaman yang sudah selesai digunakan."
              icon={CalendarClock}
              tone="neutral"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-sm sm:p-6">
              <h3 className="text-xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                Booking Terdekat
              </h3>

              {approvedUpcomingBooking ? (
                <div className="mt-5 rounded-[1.25rem] bg-[color:var(--color-primary-container)] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--color-on-primary-container)]">
                        {approvedUpcomingBooking.room_name ?? "Ruangan"}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--color-on-primary-container)]">
                        {formatIndonesianDate(approvedUpcomingBooking.booking_date)} -{" "}
                        {formatTimeRangeLabel(
                          approvedUpcomingBooking.start_at,
                          approvedUpcomingBooking.end_at,
                        )}{" "}
                        WIB
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--color-on-primary-container)]/80">
                        Keperluan: {approvedUpcomingBooking.purpose}
                      </p>
                    </div>
                    <BookingStatusBadge status={approvedUpcomingBooking.status} />
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.25rem] border border-dashed border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-subtle)] p-5">
                  <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                    Belum ada booking terdekat
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    Anda belum memiliki booking berstatus disetujui yang akan
                    berlangsung dalam waktu dekat.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-sm sm:p-6">
              <h3 className="text-xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                Ringkasan Cepat
              </h3>
              <div className="mt-5 space-y-4">
                <div className="rounded-xl bg-[color:var(--color-surface-subtle)] p-4">
                  <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                    Status terakhir
                  </p>
                  <p className="mt-1 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {latestBooking
                      ? `Booking terbaru Anda saat ini berstatus ${latestBooking.status.toLowerCase()}.`
                      : "Belum ada aktivitas booking yang tercatat untuk akun Anda."}
                  </p>
                </div>
                <div className="rounded-xl bg-[color:var(--color-surface-subtle)] p-4">
                  <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                    Rekomendasi
                  </p>
                  <p className="mt-1 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    Ajukan peminjaman minimal satu hari sebelum penggunaan agar
                    peluang disetujui lebih besar.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                Riwayat Booking Terbaru
              </h3>
              <span className="text-sm text-[color:var(--color-text-secondary)]">
                {bookings.length} aktivitas terbaru
              </span>
            </div>

            {bookings.length > 0 ? (
              <div className="mt-5 space-y-4">
                {bookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/mahasiswa/bookings/${booking.id}`}
                    className="flex flex-col gap-3 rounded-xl border border-[color:var(--color-border)] p-4 transition hover:border-[color:var(--color-primary)]/30 hover:shadow-sm md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                        {booking.room_name ?? "Ruangan"}
                      </p>
                      <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                        {booking.booking_code}
                      </p>
                      <p className="mt-1 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                        {formatIndonesianDate(booking.booking_date)} -{" "}
                        {formatTimeRangeLabel(booking.start_at, booking.end_at)} WIB
                      </p>
                    </div>
                    <BookingStatusBadge status={booking.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  title="Belum ada riwayat booking"
                  description="Mulai dari halaman cari ruangan untuk membuat pengajuan pertama Anda."
                />
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
