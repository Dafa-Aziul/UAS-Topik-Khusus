"use client";

import { ArrowRight, Building2, CalendarDays, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { AvailabilityTimeline } from "@/components/rooms/availability-timeline";
import { RoomStatusBadge } from "@/components/rooms/room-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRoomAvailability, useRoomDetail } from "@/hooks/use-rooms";
import { formatIndonesianDate, getTodayInputValue } from "@/lib/date";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

type RoomDetailClientProps = {
  roomId: string;
};

function getDefaultDate() {
  return getTodayInputValue();
}

export function RoomDetailClient({ roomId }: RoomDetailClientProps) {
  const [date, setDate] = useState(getDefaultDate());
  const detailQuery = useRoomDetail(roomId);
  const availabilityQuery = useRoomAvailability(roomId, date);
  const room = detailQuery.data?.data;

  if (detailQuery.isLoading) {
    return <LoadingSkeleton lines={8} />;
  }

  if (detailQuery.isError || !room) {
    return (
      <ErrorState
        description="Detail ruangan belum berhasil dimuat. Coba periksa koneksi Anda atau buka ulang halaman ini."
        actionLabel="Muat Ulang"
        onAction={() => detailQuery.refetch()}
      />
    );
  }

  const imageUrl = resolveMediaUrl(room.image_url);
  const availability = availabilityQuery.data?.data;
  const canBookRoom =
    room.status === "AVAILABLE" && (availability?.is_bookable ?? true);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Detail Ruangan"
        description="Lihat informasi lengkap ruangan, fasilitas, dan ketersediaan jadwal sebelum mengajukan peminjaman."
        breadcrumb={
          <nav className="flex flex-wrap items-center gap-2 text-sm sm:gap-2.5 sm:text-[15px]">
            <Link
              href="/mahasiswa/dashboard"
              className="transition hover:text-[color:var(--color-primary)]"
            >
              Dashboard
            </Link>
            <span>/</span>
            <Link
              href="/mahasiswa/rooms"
              className="transition hover:text-[color:var(--color-primary)]"
            >
              Cari Ruangan
            </Link>
            <span>/</span>
            <span className="font-semibold text-[color:var(--color-primary)]">
              Detail Ruangan
            </span>
          </nav>
        }
      />

      <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="relative min-h-[320px] overflow-hidden rounded-[1.5rem] border border-[color:var(--color-border)] bg-[linear-gradient(135deg,#dbeafe_0%,#93c5fd_40%,#eff6ff_100%)] shadow-sm sm:rounded-[1.75rem]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={room.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.92),transparent_28%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.1)_0%,rgba(15,23,42,0.55)_100%)]" />
          <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80">
              {room.code}
            </p>
            <h2 className="mt-3 text-[2rem] font-bold tracking-[-0.03em] text-white sm:text-4xl">
              {room.name}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">
              {room.description}
            </p>
          </div>
        </div>

        <aside className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm sm:rounded-[1.75rem] sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <RoomStatusBadge status={room.status} />
          </div>

          <div className="mt-6 space-y-4 text-sm text-[color:var(--color-text-secondary)]">
            <div className="flex items-start gap-3">
              <Building2 className="mt-0.5 size-4 shrink-0 text-[color:var(--color-primary)]" />
              <span>
                {room.building}, Lantai {room.floor}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[color:var(--color-primary)]" />
              <span>{room.location_description}</span>
            </div>
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 size-4 shrink-0 text-[color:var(--color-primary)]" />
              <span>Kapasitas {room.capacity} orang</span>
            </div>
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-[color:var(--color-primary)]" />
              <span>
                Waktu penggunaan umumnya berlangsung antara 07.00 - 21.00 WIB
              </span>
            </div>
          </div>

          {canBookRoom ? (
            <Link
              href={`/mahasiswa/bookings/create?roomId=${room.id}&date=${date}`}
              className={cn(buttonVariants(), "mt-8 h-11 w-full rounded-xl")}
            >
              Ajukan Peminjaman
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <div
              className={cn(
                buttonVariants(),
                "mt-8 h-11 w-full rounded-xl pointer-events-none opacity-50",
              )}
            >
              Ajukan Peminjaman
              <ArrowRight className="size-4" />
            </div>
          )}

          {!availabilityQuery.isLoading && availability && !availability.is_bookable ? (
            <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-secondary)]">
              Ruangan tidak dapat diajukan pada tanggal ini karena status atau
              ketersediaannya tidak memenuhi syarat booking.
            </p>
          ) : null}
        </aside>
      </section>

      <section className="grid gap-8 xl:grid-cols-[1fr_0.95fr]">
        <div className="space-y-8">
          <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
              Deskripsi
            </h3>
            <p className="mt-4 text-sm leading-8 text-[color:var(--color-text-secondary)]">
              {room.description}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
              Fasilitas
            </h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {room.facilities.map((facility) => (
                <div
                  key={facility}
                  className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] p-4 text-center text-sm font-semibold text-[color:var(--color-text-primary)]"
                >
                  {facility}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm sm:p-6">
            <label className="block text-sm font-semibold text-[color:var(--color-text-primary)]">
              Pilih tanggal ketersediaan
            </label>
            <Input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-3 h-11 rounded-xl"
            />
            <p className="mt-2 text-xs text-[color:var(--color-text-secondary)]">
              {formatIndonesianDate(date)}
            </p>
          </div>

          {availabilityQuery.isLoading ? <LoadingSkeleton lines={5} showHeader={false} /> : null}

          {availabilityQuery.isError ? (
            <ErrorState
              description="Ketersediaan ruangan belum berhasil dimuat untuk tanggal ini."
              actionLabel="Coba Lagi"
              onAction={() => availabilityQuery.refetch()}
            />
          ) : null}

          {!availabilityQuery.isLoading &&
          !availabilityQuery.isError &&
          availability ? (
            <AvailabilityTimeline availability={availability} />
          ) : null}

          {!availabilityQuery.isLoading &&
          !availabilityQuery.isError &&
          !availability ? (
            <EmptyState
              title="Belum ada data ketersediaan"
              description="Pilih tanggal lain atau coba lagi beberapa saat untuk melihat jadwal ruangan ini."
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
