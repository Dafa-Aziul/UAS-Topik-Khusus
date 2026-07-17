"use client";

import {
  ArrowLeft,
  CalendarDays,
  CircleAlert,
  Clock3,
  DoorOpen,
  MapPin,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useCancelBookingMutation, useMyBookingDetail } from "@/hooks/use-bookings";
import { getApiErrorMessage } from "@/lib/auth";
import {
  formatIndonesianDate,
  formatTimeRangeLabel,
} from "@/lib/date";
import { BookingStatus } from "@/types/booking";

type BookingDetailClientProps = {
  bookingId: string;
};

type TimelineItem = {
  status: BookingStatus;
  label: string;
  description: string;
};

function getTimelineItems(status: BookingStatus): TimelineItem[] {
  const base: TimelineItem[] = [
    {
      status: "PENDING",
      label: "Menunggu Persetujuan",
      description: "Pengajuan sedang menunggu verifikasi dari admin Roomify.",
    },
  ];

  if (status === "REJECTED") {
    return [
      ...base,
      {
        status: "REJECTED",
        label: "Ditolak",
        description: "Pengajuan tidak dapat dilanjutkan. Periksa catatan admin.",
      },
    ];
  }

  if (status === "CANCELLED") {
    return [
      ...base,
      {
        status: "CANCELLED",
        label: "Dibatalkan",
        description: "Peminjaman dibatalkan dan slot ruangan dikembalikan.",
      },
    ];
  }

  return [
    ...base,
    {
      status: "APPROVED",
      label: "Disetujui",
      description: "Booking dapat digunakan sesuai jadwal yang tercantum.",
    },
    {
      status: "COMPLETED",
      label: "Selesai",
      description: "Peminjaman sudah selesai dipakai sesuai jadwalnya.",
    },
  ];
}

function getTimelineState(
  currentStatus: BookingStatus,
  itemStatus: BookingStatus,
  timelineItems: TimelineItem[],
) {
  const currentIndex = timelineItems.findIndex(
    (item) => item.status === currentStatus,
  );
  const itemIndex = timelineItems.findIndex((item) => item.status === itemStatus);

  if (itemStatus === currentStatus) {
    return "current";
  }

  if (itemIndex !== -1 && currentIndex !== -1 && itemIndex < currentIndex) {
    return "complete";
  }

  return "upcoming";
}

function getStatusHeadline(status: BookingStatus) {
  switch (status) {
    case "PENDING":
      return "Pengajuan Anda sedang ditinjau admin.";
    case "APPROVED":
      return "Booking sudah disetujui dan siap dipakai sesuai jadwal.";
    case "REJECTED":
      return "Pengajuan ditolak. Periksa catatan admin untuk detailnya.";
    case "CANCELLED":
      return "Booking sudah dibatalkan dan slot ruangan dikembalikan.";
    case "COMPLETED":
      return "Peminjaman telah selesai dilaksanakan.";
    default:
      return "";
  }
}

function canCancel(status: BookingStatus) {
  return status === "PENDING" || status === "APPROVED";
}

export function BookingDetailClient({ bookingId }: BookingDetailClientProps) {
  const router = useRouter();
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const detailQuery = useMyBookingDetail(bookingId);
  const cancelMutation = useCancelBookingMutation(bookingId);
  const booking = detailQuery.data?.data;
  const timelineItems = booking ? getTimelineItems(booking.status) : [];

  if (detailQuery.isLoading) {
    return <LoadingSkeleton lines={8} />;
  }

  if (detailQuery.isError || !booking) {
    return (
      <ErrorState
        description="Detail peminjaman belum berhasil dimuat."
        actionLabel="Coba Lagi"
        onAction={() => detailQuery.refetch()}
      />
    );
  }

  const handleCancelBooking = async () => {
    await cancelMutation.mutateAsync(undefined, {
      onSuccess: () => {
        setConfirmCancelOpen(false);
        toast.success("Peminjaman berhasil dibatalkan.");
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Peminjaman"
        description="Tinjau rincian booking, status pengajuan terbaru, dan catatan admin untuk peminjaman ruangan Anda."
        breadcrumb={
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex flex-wrap items-center gap-2 text-sm sm:gap-2.5 sm:text-[15px]">
              <Link
                href="/mahasiswa/bookings"
                className="transition hover:text-[color:var(--color-primary)]"
              >
                Peminjaman Saya
              </Link>
              <span>/</span>
              <span className="font-semibold text-[color:var(--color-primary)]">
                {booking.booking_code}
              </span>
            </nav>

            <div className="flex w-full sm:w-auto">
              <BookingStatusBadge status={booking.status} />
            </div>
          </div>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm sm:rounded-[1.75rem] sm:p-6">
            <div className="mb-5 rounded-[1.25rem] bg-[color:var(--color-accent)] px-4 py-3 text-sm leading-6 text-[color:var(--color-primary)] sm:mb-6 sm:px-5 sm:py-4">
              {getStatusHeadline(booking.status)}
            </div>

            <div className="flex flex-col gap-6 md:grid md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                    ID Peminjaman
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[color:var(--color-primary)]">
                    {booking.booking_code}
                  </h2>
                </div>

                <div className="space-y-4 text-sm text-[color:var(--color-text-secondary)]">
                  <div className="flex items-start gap-3">
                    <DoorOpen className="mt-0.5 size-4 text-[color:var(--color-primary)]" />
                    <div>
                      <p className="font-semibold text-[color:var(--color-text-primary)]">
                        {booking.room_name ?? "Ruangan"}
                      </p>
                      <p>{booking.room_code ?? "Kode ruangan belum tersedia"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 size-4 text-[color:var(--color-primary)]" />
                    <div>
                      <p className="font-semibold text-[color:var(--color-text-primary)]">
                        Tanggal kegiatan
                      </p>
                      <p>{formatIndonesianDate(booking.booking_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 size-4 text-[color:var(--color-primary)]" />
                    <div>
                      <p className="font-semibold text-[color:var(--color-text-primary)]">
                        Waktu penggunaan
                      </p>
                      <p>
                        {formatTimeRangeLabel(booking.start_at, booking.end_at)} WIB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 size-4 text-[color:var(--color-primary)]" />
                    <div>
                      <p className="font-semibold text-[color:var(--color-text-primary)]">
                        Jumlah peserta
                      </p>
                      <p>{booking.participant_count} orang</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] p-4 sm:p-5">
                <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                  Tujuan peminjaman
                </p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  {booking.purpose}
                </p>

                <div className="mt-5 rounded-[1rem] border border-[color:var(--color-border)] bg-white p-4">
                  <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                    Catatan admin
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {booking.admin_note ?? "Belum ada catatan admin untuk booking ini."}
                  </p>
                </div>

                {booking.user_note ? (
                  <div className="mt-4 rounded-[1rem] border border-[color:var(--color-border)] bg-white p-4">
                    <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                      Catatan tambahan Anda
                    </p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                      {booking.user_note}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm sm:rounded-[1.75rem] sm:p-6">
            <h3 className="text-xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
              Timeline Status
            </h3>

            <div className="mt-6 space-y-4">
              {timelineItems.map((item, index) => {
                const state = getTimelineState(
                  booking.status,
                  item.status,
                  timelineItems,
                );

                return (
                  <div key={item.status} className="flex gap-3 sm:gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={
                          state === "current"
                            ? "size-4 rounded-full bg-[color:var(--color-primary)] ring-4 ring-[color:var(--color-accent)]"
                            : state === "complete"
                              ? "size-4 rounded-full bg-[color:var(--color-success)]"
                              : "size-4 rounded-full bg-[color:var(--color-border)]"
                        }
                      />
                      {index < timelineItems.length - 1 ? (
                        <div className="mt-2 h-full w-px bg-[color:var(--color-border)]" />
                      ) : null}
                    </div>

                    <div className="pb-5">
                      <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm sm:rounded-[1.75rem] sm:p-6">
            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
              Aksi Booking
            </h3>

            <div className="mt-5 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-xl"
                onClick={() => router.push("/mahasiswa/bookings")}
              >
                <ArrowLeft className="size-4" />
                Kembali ke daftar
              </Button>

              {canCancel(booking.status) ? (
                <Button
                  type="button"
                  variant="destructive"
                  className="h-11 w-full rounded-xl"
                  onClick={() => setConfirmCancelOpen(true)}
                  disabled={cancelMutation.isPending}
                >
                  <CircleAlert className="size-4" />
                  {cancelMutation.isPending
                    ? "Membatalkan..."
                    : "Batalkan Peminjaman"}
                </Button>
              ) : null}
            </div>

            <p className="mt-4 text-xs leading-6 text-[color:var(--color-text-secondary)]">
              Pembatalan hanya tersedia untuk booking berstatus menunggu atau
              sudah disetujui, selama peminjaman masih dapat dibatalkan.
            </p>
          </section>

          <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm sm:rounded-[1.75rem] sm:p-6">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 size-5 text-[color:var(--color-primary)]" />
              <div>
                <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                  Ringkasan lokasi
                </p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Informasi gedung dan lokasi ruangan membantu Anda memastikan
                  peminjaman sudah sesuai dengan ruang yang dipilih.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </section>

      <AlertDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        title="Batalkan peminjaman?"
        description={`Peminjaman ${booking.room_name ?? "ruangan ini"} pada ${formatIndonesianDate(booking.booking_date)} akan dibatalkan dan slot ruangan dikembalikan.`}
        confirmLabel="Ya, batalkan"
        cancelLabel="Tutup"
        confirmVariant="destructive"
        isLoading={cancelMutation.isPending}
        onConfirm={handleCancelBooking}
      />
    </div>
  );
}
