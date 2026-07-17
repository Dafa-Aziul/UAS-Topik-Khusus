"use client";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Edit3,
  ImageIcon,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

type AdminRoomDetailClientProps = {
  roomId: string;
};

export function AdminRoomDetailClient({
  roomId,
}: AdminRoomDetailClientProps) {
  const [date, setDate] = useState(getTodayInputValue());
  const detailQuery = useRoomDetail(roomId);
  const availabilityQuery = useRoomAvailability(roomId, date);
  const room = detailQuery.data?.data;

  if (detailQuery.isLoading) {
    return <LoadingSkeleton lines={8} />;
  }

  if (detailQuery.isError || !room) {
    return (
      <ErrorState
        description="Detail ruangan admin belum berhasil dimuat."
        actionLabel="Coba Lagi"
        onAction={() => detailQuery.refetch()}
      />
    );
  }

  const imageUrl = resolveMediaUrl(room.image_url);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Ruangan"
        description="Tinjau informasi lengkap ruangan, fasilitas, status aktif, dan kesiapan ruangan sebelum melakukan perubahan data."
        breadcrumb={
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex flex-wrap items-center gap-2 text-sm sm:gap-2.5 sm:text-[15px]">
              <Link
                href="/admin/dashboard"
                className="transition hover:text-[color:var(--color-primary)]"
              >
                Dashboard
              </Link>
              <span>/</span>
              <Link
                href="/admin/rooms"
                className="transition hover:text-[color:var(--color-primary)]"
              >
                Ruangan
              </Link>
              <span>/</span>
              <span className="font-semibold text-[color:var(--color-primary)]">
                {room.name}
              </span>
            </nav>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href="/admin/rooms"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full rounded-xl sm:w-auto",
                )}
              >
                <ArrowLeft className="size-4" />
                Kembali
              </Link>
              <Link
                href={`/admin/rooms/${room.id}/edit`}
                className={cn(
                  buttonVariants(),
                  "w-full rounded-xl text-white hover:text-white sm:w-auto",
                )}
              >
                <Edit3 className="size-4" />
                Edit Ruangan
              </Link>
            </div>
          </div>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[1.75rem] border border-[color:var(--color-border)] bg-white shadow-sm">
          <div className="relative min-h-[320px] bg-[linear-gradient(135deg,#dbeafe_0%,#bfdbfe_42%,#eff6ff_100%)]">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={room.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(15,23,42,0.62)_100%)]" />
            <div className="absolute left-6 top-6">
              <RoomStatusBadge status={room.status} />
            </div>
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
                {room.code}
              </p>
              <h2 className="mt-3 text-4xl font-bold tracking-[-0.03em] text-white">
                {room.name}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">
                {room.description}
              </p>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
              Informasi Utama
            </h3>

            <div className="mt-5 space-y-4 text-sm text-[color:var(--color-text-secondary)]">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 size-4 text-[color:var(--color-primary)]" />
                <div>
                  <p className="font-medium text-[color:var(--color-text-primary)]">
                    Gedung dan lantai
                  </p>
                  <p>
                    {room.building}, Lantai {room.floor}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-4 text-[color:var(--color-primary)]" />
                <div>
                  <p className="font-medium text-[color:var(--color-text-primary)]">
                    Lokasi detail
                  </p>
                  <p>{room.location_description}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="mt-0.5 size-4 text-[color:var(--color-primary)]" />
                <div>
                  <p className="font-medium text-[color:var(--color-text-primary)]">
                    Kapasitas
                  </p>
                  <p>{room.capacity} orang</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-4 text-[color:var(--color-primary)]" />
                <div>
                  <p className="font-medium text-[color:var(--color-text-primary)]">
                    Status operasional
                  </p>
                  <div className="mt-2">
                    <RoomStatusBadge status={room.status} />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ImageIcon className="mt-0.5 size-4 text-[color:var(--color-primary)]" />
                <div>
                  <p className="font-medium text-[color:var(--color-text-primary)]">
                    Foto ruangan
                  </p>
                  <p>{room.image_url ? "Sudah tersedia" : "Belum ada gambar"}</p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
            Deskripsi Ruangan
          </h3>
          <p className="mt-4 text-sm leading-8 text-[color:var(--color-text-secondary)]">
            {room.description}
          </p>
        </div>

        <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
            Fasilitas Tersedia
          </h3>

          <div className="mt-5 flex flex-wrap gap-3">
            {room.facilities.map((facility) => (
              <span
                key={facility}
                className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-primary)]"
              >
                {facility}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[color:var(--color-primary)]" />
            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
              Cek Jadwal Ruangan
            </h3>
          </div>

          <label className="mt-5 block text-sm font-semibold text-[color:var(--color-text-primary)]">
            Pilih tanggal
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

          <div className="mt-5 rounded-[1rem] bg-[color:var(--color-accent)] px-4 py-3 text-sm leading-6 text-[color:var(--color-primary)]">
            Admin dapat memakai tampilan ini untuk memverifikasi slot yang
            sudah terblokir sebelum mengubah status ruangan atau meninjau
            permohonan peminjaman.
          </div>
        </div>

        <div>
          {availabilityQuery.isLoading ? (
            <LoadingSkeleton lines={5} showHeader={false} />
          ) : null}

          {availabilityQuery.isError ? (
            <ErrorState
              description="Jadwal ruangan belum berhasil dimuat untuk tanggal ini."
              actionLabel="Coba Lagi"
              onAction={() => availabilityQuery.refetch()}
            />
          ) : null}

          {!availabilityQuery.isLoading &&
          !availabilityQuery.isError &&
          availabilityQuery.data?.data ? (
            <AvailabilityTimeline availability={availabilityQuery.data.data} />
          ) : null}
        </div>
      </section>
    </div>
  );
}
