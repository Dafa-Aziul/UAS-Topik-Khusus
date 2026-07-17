"use client";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DoorOpen,
  MapPin,
  UserRound,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { BookingStatusBadge } from "@/components/bookings/booking-status-badge";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { RoomStatusBadge } from "@/components/rooms/room-status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminBookingDetail,
  useApproveBookingMutation,
  useCompleteBookingMutation,
  useRejectBookingMutation,
} from "@/hooks/use-admin-bookings";
import { getApiErrorCode, getApiErrorMessage } from "@/lib/auth";
import { formatIndonesianDate, formatTimeRangeLabel } from "@/lib/date";
import { resolveMediaUrl } from "@/lib/media";

type AdminBookingDetailClientProps = {
  bookingId: string;
};

export function AdminBookingDetailClient({
  bookingId,
}: AdminBookingDetailClientProps) {
  const router = useRouter();
  const [adminNote, setAdminNote] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);
  const detailQuery = useAdminBookingDetail(bookingId);
  const approveMutation = useApproveBookingMutation(bookingId);
  const rejectMutation = useRejectBookingMutation(bookingId);
  const completeMutation = useCompleteBookingMutation(bookingId);
  const booking = detailQuery.data?.data;

  if (detailQuery.isLoading) {
    return <LoadingSkeleton lines={9} />;
  }

  if (detailQuery.isError || !booking) {
    return (
      <ErrorState
        description="Detail permohonan admin belum berhasil dimuat."
        actionLabel="Coba Lagi"
        onAction={() => detailQuery.refetch()}
      />
    );
  }

  const isPending = booking.status === "PENDING";
  const isApproved = booking.status === "APPROVED";
  const roomImageUrl = resolveMediaUrl(booking.room_image_url);

  const handleMutationError = async (error: unknown) => {
    const errorCode = getApiErrorCode(error);

    if (errorCode === "INVALID_BOOKING_STATUS") {
      toast.error(
        "Status booking sudah berubah di server. Data terbaru sedang dimuat ulang.",
      );
      await detailQuery.refetch();
      return;
    }

    if (errorCode === "BOOKING_TIME_CONFLICT") {
      toast.error(
        "Jadwal bentrok dengan booking lain yang sudah disetujui. Periksa ulang detail terbaru.",
      );
      await detailQuery.refetch();
      return;
    }

    toast.error(getApiErrorMessage(error));
  };

  const handleApprove = async () => {
    setNoteError(null);

    await approveMutation.mutateAsync(
      { admin_note: adminNote.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Permohonan berhasil disetujui.");
        },
        onError: async (error) => {
          await handleMutationError(error);
        },
      },
    );
  };

  const handleReject = async () => {
    if (!adminNote.trim()) {
      setNoteError("Alasan penolakan wajib diisi sebelum permohonan ditolak.");
      toast.error("Alasan penolakan wajib diisi.");
      return;
    }

    setNoteError(null);

    await rejectMutation.mutateAsync(
      { admin_note: adminNote.trim() },
      {
        onSuccess: () => {
          toast.success("Permohonan berhasil ditolak.");
        },
        onError: async (error) => {
          await handleMutationError(error);
        },
      },
    );
  };

  const handleComplete = async () => {
    await completeMutation.mutateAsync(undefined, {
      onSuccess: () => {
        toast.success("Booking berhasil ditandai selesai.");
      },
      onError: async (error) => {
        await handleMutationError(error);
      },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detail Permohonan"
        description="Periksa data mahasiswa, ruangan, jadwal, dan catatan sebelum menyetujui, menolak, atau menyelesaikan booking."
        breadcrumb={
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex flex-wrap items-center gap-2 text-sm sm:gap-2.5 sm:text-[15px]">
              <Link
                href="/admin/bookings"
                className="transition hover:text-[color:var(--color-primary)]"
              >
                Peminjaman
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

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[1.75rem] border border-[color:var(--color-border)] bg-white shadow-sm">
            <div className="relative min-h-[280px] bg-[linear-gradient(135deg,#dbeafe_0%,#bfdbfe_45%,#eff6ff_100%)]">
              {roomImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={roomImageUrl}
                  alt={booking.room_name ?? booking.room_id}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(15,23,42,0.68)_100%)]" />
              <div className="absolute left-6 top-6">
                {booking.room_status ? (
                  <RoomStatusBadge status={booking.room_status} />
                ) : null}
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                  {booking.room_code ?? booking.room_id}
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-white">
                  {booking.room_name ?? "Detail Ruangan"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">
                  {booking.room_description ??
                    "Gunakan detail ini untuk memastikan ruangan, jadwal, dan tujuan booking sudah sesuai sebelum keputusan admin diambil."}
                </p>
              </div>
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[color:var(--color-accent)] text-[color:var(--color-primary)]">
                  <UserRound className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                    Mahasiswa
                  </p>
                  <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                    {booking.user_name ?? booking.user_email ?? booking.user_id}
                  </h3>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-[color:var(--color-text-secondary)]">
                <p>
                  <span className="font-semibold text-[color:var(--color-text-primary)]">
                    NIM:
                  </span>{" "}
                  {booking.user_nim ?? "-"}
                </p>
                <p>
                  <span className="font-semibold text-[color:var(--color-text-primary)]">
                    Email:
                  </span>{" "}
                  {booking.user_email ?? "-"}
                </p>
                <p>
                  <span className="font-semibold text-[color:var(--color-text-primary)]">
                    User ID:
                  </span>{" "}
                  {booking.user_id}
                </p>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[color:var(--color-accent)] text-[color:var(--color-primary)]">
                  <DoorOpen className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                    Ruangan
                  </p>
                  <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                    {booking.room_name ?? booking.room_id}
                  </h3>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-[color:var(--color-text-secondary)]">
                <p>
                  <span className="font-semibold text-[color:var(--color-text-primary)]">
                    Kode:
                  </span>{" "}
                  {booking.room_code ?? "-"}
                </p>
                <p>
                  <span className="font-semibold text-[color:var(--color-text-primary)]">
                    Lokasi:
                  </span>{" "}
                  {booking.room_building
                    ? `${booking.room_building}, Lt. ${booking.room_floor ?? "-"}`
                    : booking.room_location_description ?? "-"}
                </p>
                <p>
                  <span className="font-semibold text-[color:var(--color-text-primary)]">
                    Kapasitas:
                  </span>{" "}
                  {booking.room_capacity ? `${booking.room_capacity} orang` : "-"}
                </p>
              </div>
            </section>
          </div>

          <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
              Informasi Jadwal dan Tujuan
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-[color:var(--color-surface-subtle)] p-4">
                <div className="flex items-center gap-2 text-[color:var(--color-primary)]">
                  <CalendarDays className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                    Tanggal
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-[color:var(--color-text-primary)]">
                  {formatIndonesianDate(booking.booking_date)}
                </p>
              </div>

              <div className="rounded-xl bg-[color:var(--color-surface-subtle)] p-4">
                <div className="flex items-center gap-2 text-[color:var(--color-primary)]">
                  <Clock3 className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                    Jadwal
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-[color:var(--color-text-primary)]">
                  {formatTimeRangeLabel(booking.start_at, booking.end_at)} WIB
                </p>
              </div>

              <div className="rounded-xl bg-[color:var(--color-surface-subtle)] p-4">
                <div className="flex items-center gap-2 text-[color:var(--color-primary)]">
                  <MapPin className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                    Peserta
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-[color:var(--color-text-primary)]">
                  {booking.participant_count} orang
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] p-4">
                <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                  Tujuan peminjaman
                </p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  {booking.purpose}
                </p>
              </div>

              {booking.user_note ? (
                <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] p-4">
                  <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                    Catatan mahasiswa
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {booking.user_note}
                  </p>
                </div>
              ) : null}

              {booking.room_facilities?.length ? (
                <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] p-4">
                  <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                    Fasilitas ruangan
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {booking.room_facilities.map((facility) => (
                      <span
                        key={facility}
                        className="rounded-full border border-[color:var(--color-border)] bg-white px-3 py-1 text-xs font-semibold text-[color:var(--color-text-primary)]"
                      >
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[color:var(--color-text-primary)]">
              Keputusan Admin
            </h3>

            <Textarea
              value={adminNote}
              onChange={(event) => {
                setAdminNote(event.target.value);
                if (event.target.value.trim()) {
                  setNoteError(null);
                }
              }}
              rows={5}
              className={
                noteError
                  ? "mt-5 border-[color:var(--color-danger)] focus-visible:border-[color:var(--color-danger)] focus-visible:ring-[color:var(--color-danger)]/15"
                  : "mt-5 border-[color:var(--color-border)] focus-visible:border-[color:var(--color-primary)] focus-visible:ring-[color:var(--color-primary)]/15"
              }
              placeholder="Tulis catatan persetujuan atau alasan penolakan di sini..."
            />

            {noteError ? (
              <div className="mt-3 rounded-xl border border-red-200 bg-[color:var(--color-danger-container)] px-4 py-3 text-sm text-[color:var(--color-on-danger-container)]">
                {noteError}
              </div>
            ) : null}

            {booking.admin_note ? (
              <div className="mt-4 rounded-xl bg-[color:var(--color-surface-subtle)] p-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                <p className="font-semibold text-[color:var(--color-text-primary)]">
                  Catatan admin terakhir
                </p>
                <p className="mt-2">{booking.admin_note}</p>
              </div>
            ) : null}

            <div className="mt-4 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] p-4 text-sm text-[color:var(--color-text-secondary)]">
              <p className="font-semibold text-[color:var(--color-text-primary)]">
                Riwayat status
              </p>
              <div className="mt-3 space-y-2 leading-7">
                {booking.reviewed_at ? (
                  <p>
                    Direview pada {formatIndonesianDate(booking.reviewed_at)}.
                  </p>
                ) : null}
                {booking.completed_at ? (
                  <p>
                    Ditandai selesai pada{" "}
                    {formatIndonesianDate(booking.completed_at)}.
                  </p>
                ) : null}
                {booking.cancelled_at ? (
                  <p>
                    Dibatalkan pada {formatIndonesianDate(booking.cancelled_at)}.
                  </p>
                ) : null}
                {!booking.reviewed_at &&
                !booking.completed_at &&
                !booking.cancelled_at ? (
                  <p>Belum ada riwayat tindakan tambahan untuk permohonan ini.</p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {isPending ? (
                <>
                  <Button
                    type="button"
                    className="h-11 w-full rounded-xl"
                    onClick={handleApprove}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    <CheckCircle2 className="size-4" />
                    {approveMutation.isPending
                      ? "Menyetujui..."
                      : "Setujui Permohonan"}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    className="h-11 w-full rounded-xl"
                    onClick={handleReject}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                  >
                    <XCircle className="size-4" />
                    {rejectMutation.isPending
                      ? "Menolak..."
                      : "Tolak Permohonan"}
                  </Button>
                </>
              ) : null}

              {isApproved ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl"
                  onClick={handleComplete}
                  disabled={completeMutation.isPending}
                >
                  <CheckCircle2 className="size-4" />
                  {completeMutation.isPending
                    ? "Menyelesaikan..."
                    : "Tandai Selesai"}
                </Button>
              ) : null}

              <Button
                type="button"
                variant="outline"
                className="h-11 w-full rounded-xl"
                onClick={() => router.push("/admin/bookings")}
              >
                <ArrowLeft className="size-4" />
                Kembali ke daftar
              </Button>
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
