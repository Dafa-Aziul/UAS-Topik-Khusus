"use client";

import {
  Activity,
  Building2,
  CalendarRange,
  CheckCheck,
  Clock3,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";

import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { StatCard } from "@/components/dashboards/stat-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import {
  useAdminBookingTrend,
  useAdminDashboard,
  useAdminRoomUsage,
} from "@/hooks/use-dashboard";
import { useAdminBookings } from "@/hooks/use-admin-bookings";
import { formatIndonesianDate, formatTimeRangeLabel } from "@/lib/date";

function getTrendLabel(value: string) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(
    new Date(value),
  );
}

function formatTrendTooltipValue(value: ValueType | undefined) {
  const total = typeof value === "number" ? value : Number(value ?? 0);
  return [`${total} booking`, "Total"] as const;
}

export function AdminDashboardClient() {
  const summaryQuery = useAdminDashboard();
  const trendQuery = useAdminBookingTrend();
  const roomUsageQuery = useAdminRoomUsage();
  const pendingQuery = useAdminBookings({
    status: "PENDING",
    page: 1,
    limit: 5,
    sort: "start_at",
  });

  const summary = summaryQuery.data?.data;
  const trend = trendQuery.data?.data ?? [];
  const roomUsage = roomUsageQuery.data?.data ?? [];
  const pendingBookings = pendingQuery.data?.data ?? [];
  const maxRoomUsage = Math.max(...roomUsage.map((item) => item.total_bookings), 1);
  const isLoading =
    summaryQuery.isLoading ||
    trendQuery.isLoading ||
    roomUsageQuery.isLoading ||
    pendingQuery.isLoading;
  const hasError =
    summaryQuery.isError ||
    trendQuery.isError ||
    roomUsageQuery.isError ||
    pendingQuery.isError;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Admin"
        description="Pantau ringkasan operasional, permohonan yang menunggu tindakan, dan performa penggunaan ruangan."
      />

      {isLoading ? <LoadingSkeleton lines={10} /> : null}

      {hasError ? (
        <ErrorState
          description="Dashboard admin belum berhasil dimuat. Coba periksa koneksi Anda lalu muat ulang halaman."
          actionLabel="Coba Lagi"
          onAction={() => {
            void summaryQuery.refetch();
            void trendQuery.refetch();
            void roomUsageQuery.refetch();
            void pendingQuery.refetch();
          }}
        />
      ) : null}

      {!isLoading && !hasError && summary ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Mahasiswa Aktif"
              value={String(summary.total_active_students)}
              description="Mahasiswa dengan akun aktif yang bisa mengajukan booking."
              icon={Users}
              tone="primary"
            />
            <StatCard
              title="Total Ruangan"
              value={String(summary.total_rooms)}
              description="Jumlah ruangan yang dikelola dalam sistem Roomify."
              icon={Building2}
              tone="neutral"
            />
            <StatCard
              title="Menunggu Persetujuan"
              value={String(summary.booking_status_summary.PENDING ?? 0)}
              description="Permohonan booking yang perlu ditinjau segera."
              icon={Clock3}
              tone="warning"
            />
            <StatCard
              title="Peminjaman Selesai"
              value={String(summary.booking_status_summary.COMPLETED ?? 0)}
              description="Total booking yang sudah selesai diproses sistem."
              icon={CalendarRange}
              tone="success"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                  Tren Peminjaman
                </h3>
                <span className="text-sm text-[color:var(--color-text-secondary)]">
                  Ringkasan terbaru
                </span>
              </div>

              {trend.length > 0 ? (
                <div className="mt-6 h-72 rounded-[1.25rem] bg-[color:var(--color-surface-subtle)] p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="booking_date"
                        tickFormatter={getTrendLabel}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <Tooltip
                        formatter={formatTrendTooltipValue}
                        labelFormatter={(label) => formatIndonesianDate(label)}
                      />
                      <Bar
                        dataKey="total_bookings"
                        radius={[12, 12, 0, 0]}
                        fill="#2563eb"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyState
                    title="Belum ada tren booking"
                    description="Backend belum mengembalikan data tren peminjaman untuk dashboard admin."
                  />
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                  Status Booking
                </h3>
                <Activity className="size-5 text-[color:var(--color-primary)]" />
              </div>

              <div className="mt-6 space-y-4">
                {(["PENDING", "APPROVED", "COMPLETED"] as const).map((status) => (
                  <div
                    key={status}
                    className="rounded-xl bg-[color:var(--color-surface-subtle)] p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                        {status === "PENDING"
                          ? "Menunggu"
                          : status === "APPROVED"
                            ? "Disetujui"
                            : "Selesai"}
                      </span>
                      <BookingStatusBadge status={status} />
                    </div>
                    <p className="mt-2 text-2xl font-bold text-[color:var(--color-text-primary)]">
                      {summary.booking_status_summary[status] ?? 0}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                  Pending List
                </h3>
                <span className="inline-flex items-center gap-2 text-sm text-[color:var(--color-text-secondary)]">
                  <Clock3 className="size-4" />
                  Prioritas admin
                </span>
              </div>

              {pendingBookings.length > 0 ? (
                <div className="mt-5 space-y-4">
                  {pendingBookings.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/admin/bookings/${booking.id}`}
                      className="block rounded-xl border border-[color:var(--color-border)] p-4 transition hover:border-[color:var(--color-primary)]/30 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                            {booking.user_name ?? booking.user_id}
                          </p>
                          <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                            {booking.room_name ?? booking.room_id}
                          </p>
                          <p className="mt-1 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                            {formatIndonesianDate(booking.booking_date)} -{" "}
                            {formatTimeRangeLabel(booking.start_at, booking.end_at)} WIB
                          </p>
                        </div>
                        <BookingStatusBadge status="PENDING" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-5">
                  <EmptyState
                    title="Tidak ada booking menunggu"
                    description="Semua permohonan saat ini sudah diproses atau belum ada pengajuan baru yang perlu ditinjau."
                  />
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                  Room Usage
                </h3>
                <CheckCheck className="size-5 text-[color:var(--color-primary)]" />
              </div>

              {roomUsage.length > 0 ? (
                <div className="mt-5 space-y-5">
                  {roomUsage.map((item) => {
                    const percentage = Math.round(
                      (item.total_bookings / maxRoomUsage) * 100,
                    );

                    return (
                      <div key={item.room_id}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                              {item.room_name}
                            </p>
                            <p className="text-sm text-[color:var(--color-text-secondary)]">
                              {item.total_bookings} booking tercatat
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-[color:var(--color-primary)]">
                            {percentage}%
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-[color:var(--color-surface-subtle)]">
                          <div
                            className="h-3 rounded-full bg-[linear-gradient(90deg,#2563eb_0%,#60a5fa_100%)]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5">
                  <EmptyState
                    title="Belum ada data penggunaan"
                    description="Endpoint room usage belum mengembalikan data ruangan yang paling sering dipakai."
                  />
                </div>
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
