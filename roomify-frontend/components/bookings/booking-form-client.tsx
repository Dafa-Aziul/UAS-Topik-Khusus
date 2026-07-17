"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  Info,
  MapPin,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { AuthGuard } from "@/components/auth/auth-guard";
import { ErrorState } from "@/components/feedback/error-state";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { RoomStatusBadge } from "@/components/rooms/room-status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBookingMutation } from "@/hooks/use-bookings";
import { useRoomAvailability, useRoomDetail } from "@/hooks/use-rooms";
import { getApiErrorMessage } from "@/lib/auth";
import {
  formatIndonesianDate,
  getDurationLabel,
  getTodayInputValue,
  toJakartaIso,
} from "@/lib/date";
import { cn } from "@/lib/utils";
import {
  bookingSchema,
  type BookingSchema,
  type BookingSchemaInput,
} from "@/schemas/booking-schema";

type BookingFormClientProps = {
  roomId: string | null;
  initialDate?: string | null;
};

function formatDateLabel(value: string) {
  return formatIndonesianDate(value);
}

function BookingFormContent({
  roomId,
  initialDate,
}: {
  roomId: string;
  initialDate: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const roomQuery = useRoomDetail(roomId);
  const form = useForm<BookingSchemaInput, unknown, BookingSchema>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      booking_date: initialDate,
      participant_count: 1,
      start_time: "",
      end_time: "",
      purpose: "",
      user_note: "",
    },
  });

  const selectedDate = useWatch({
    control: form.control,
    name: "booking_date",
  });
  const startTime = useWatch({
    control: form.control,
    name: "start_time",
  });
  const endTime = useWatch({
    control: form.control,
    name: "end_time",
  });
  const participantCount = useWatch({
    control: form.control,
    name: "participant_count",
  });
  const purpose = useWatch({
    control: form.control,
    name: "purpose",
  });
  const availabilityQuery = useRoomAvailability(roomId, selectedDate);
  const room = roomQuery.data?.data;
  const createBookingMutation = useCreateBookingMutation();

  const summary = useMemo(
    () => ({
      dateLabel: selectedDate ? formatDateLabel(selectedDate) : "-",
      timeLabel:
        startTime && endTime ? `${startTime} - ${endTime}` : "-",
      durationLabel: getDurationLabel(startTime, endTime),
      participantLabel: `${participantCount || 0} orang`,
      purposeLabel: purpose?.trim() ? purpose : "-",
    }),
    [endTime, participantCount, purpose, selectedDate, startTime],
  );

  const onSubmit = form.handleSubmit(async (values) => {
    if (!room) {
      return;
    }

    if (values.participant_count > room.capacity) {
      form.setError("participant_count", {
        message: `Jumlah peserta tidak boleh melebihi kapasitas ruangan (${room.capacity}).`,
      });
      return;
    }

    await createBookingMutation.mutateAsync(
      {
        room_id: roomId,
        purpose: values.purpose,
        participant_count: values.participant_count,
        start_at: toJakartaIso(values.booking_date, values.start_time),
        end_at: toJakartaIso(values.booking_date, values.end_time),
        user_note: values.user_note?.trim() || undefined,
      },
      {
        onSuccess: async (response) => {
          toast.success("Pengajuan peminjaman berhasil dibuat.");
          await queryClient.invalidateQueries({ queryKey: ["rooms"] });
          router.push(`/mahasiswa/bookings/${response.data.id}`);
        },
      },
    );
  });

  if (roomQuery.isLoading) {
    return <LoadingSkeleton lines={8} />;
  }

  if (roomQuery.isError || !room) {
    return (
      <ErrorState
        description="Data ruangan untuk form booking belum berhasil dimuat."
        actionLabel="Coba Lagi"
        onAction={() => roomQuery.refetch()}
      />
    );
  }

  const apiError = createBookingMutation.isError
    ? getApiErrorMessage(createBookingMutation.error)
    : null;

  return (
    <AuthGuard allowedRoles={["MAHASISWA"]}>
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title="Form Peminjaman"
          description="Lengkapi detail kegiatan, waktu, dan jumlah peserta sebelum mengajukan peminjaman ruangan."
          breadcrumb={
            <nav className="flex flex-wrap items-center gap-2 text-sm sm:gap-2.5 sm:text-[15px]">
              <Link
                href="/mahasiswa/rooms"
                className="transition hover:text-[color:var(--color-primary)]"
              >
                  Cari Ruangan
              </Link>
              <span>/</span>
              <Link
                href={`/mahasiswa/rooms/${room.id}`}
                className="transition hover:text-[color:var(--color-primary)]"
              >
                {room.name}
              </Link>
              <span>/</span>
              <span className="font-semibold text-[color:var(--color-primary)]">
                Form Peminjaman
              </span>
            </nav>
          }
        />

      <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="flex flex-col gap-4 rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm sm:flex-row sm:items-center">
            <div className="min-h-24 w-full rounded-2xl bg-[linear-gradient(135deg,#dbeafe_0%,#93c5fd_45%,#eff6ff_100%)] sm:w-28" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[color:var(--color-text-secondary)]">
                Ruangan yang dipinjam
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] text-[color:var(--color-primary)]">
                {room.name} ({room.code})
              </h2>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-[color:var(--color-text-secondary)]">
                <span className="inline-flex items-center gap-2">
                  <Users className="size-4 text-[color:var(--color-primary)]" />
                  Kapasitas {room.capacity}
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="size-4 text-[color:var(--color-primary)]" />
                  {room.building}, Lantai {room.floor}
                </span>
              </div>
            </div>
            <RoomStatusBadge status={room.status} />
          </section>

          {apiError ? (
            <Alert className="rounded-xl border-red-200 bg-[color:var(--color-danger-container)] text-[color:var(--color-on-danger-container)]">
              <Info className="size-4" />
              <AlertTitle>Pengajuan belum berhasil</AlertTitle>
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          ) : null}

          <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
              Informasi Peminjaman
            </h3>

            <form className="mt-6 space-y-6" onSubmit={onSubmit}>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="booking_date">Tanggal kegiatan</Label>
                  <Input
                    id="booking_date"
                    type="date"
                    className="h-11 rounded-xl"
                    {...form.register("booking_date")}
                  />
                  <p className="text-xs text-[color:var(--color-text-secondary)]">
                    Pilih tanggal pelaksanaan kegiatan Anda.
                  </p>
                  {form.formState.errors.booking_date ? (
                    <p className="text-sm text-[color:var(--color-danger)]">
                      {form.formState.errors.booking_date.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participant_count">Jumlah peserta</Label>
                  <Input
                    id="participant_count"
                    type="number"
                    min={1}
                    max={room.capacity}
                    className="h-11 rounded-xl"
                    {...form.register("participant_count")}
                  />
                  <p className="text-xs text-[color:var(--color-text-secondary)]">
                    Kapasitas maksimal ruangan ini {room.capacity} orang.
                  </p>
                  {form.formState.errors.participant_count ? (
                    <p className="text-sm text-[color:var(--color-danger)]">
                      {form.formState.errors.participant_count.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_time">Waktu mulai</Label>
                  <Input
                    id="start_time"
                    type="time"
                    className="h-11 rounded-xl"
                    {...form.register("start_time")}
                  />
                  {form.formState.errors.start_time ? (
                    <p className="text-sm text-[color:var(--color-danger)]">
                      {form.formState.errors.start_time.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">Waktu selesai</Label>
                  <Input
                    id="end_time"
                    type="time"
                    className="h-11 rounded-xl"
                    {...form.register("end_time")}
                  />
                  {form.formState.errors.end_time ? (
                    <p className="text-sm text-[color:var(--color-danger)]">
                      {form.formState.errors.end_time.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Tujuan kegiatan</Label>
                <Textarea
                  id="purpose"
                  rows={4}
                  placeholder="Contoh: Rapat koordinasi himpunan mahasiswa informatika"
                  {...form.register("purpose")}
                />
                {form.formState.errors.purpose ? (
                  <p className="text-sm text-[color:var(--color-danger)]">
                    {form.formState.errors.purpose.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_note">Catatan tambahan</Label>
                <Textarea
                  id="user_note"
                  rows={3}
                  placeholder="Opsional, misalnya kebutuhan proyektor tambahan"
                  {...form.register("user_note")}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  size="lg"
                  className="h-11 rounded-xl"
                  disabled={
                    createBookingMutation.isPending ||
                    room.status !== "AVAILABLE"
                  }
                >
                  {createBookingMutation.isPending
                    ? "Memproses..."
                    : "Ajukan Peminjaman"}
                  <ArrowRight className="size-4" />
                </Button>
                <Link
                  href={`/mahasiswa/rooms/${room.id}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-11 rounded-xl",
                  )}
                >
                  <ArrowLeft className="size-4" />
                  Kembali
                </Link>
              </div>
            </form>
          </section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24">
          <section className="overflow-hidden rounded-[1.5rem] border border-[color:var(--color-border)] bg-white shadow-sm">
            <div className="bg-[color:var(--color-primary)] px-5 py-4 text-white">
              <h4 className="text-sm font-semibold">Ringkasan Peminjaman</h4>
            </div>
            <div className="space-y-4 p-5">
              <div className="space-y-3 border-b border-[color:var(--color-border)] pb-4 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-[color:var(--color-text-secondary)]">
                    Ruangan
                  </span>
                  <span className="text-right font-semibold text-[color:var(--color-text-primary)]">
                    {room.name} ({room.code})
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[color:var(--color-text-secondary)]">
                    Tanggal
                  </span>
                  <span className="text-right font-semibold text-[color:var(--color-text-primary)]">
                    {summary.dateLabel}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[color:var(--color-text-secondary)]">
                    Waktu
                  </span>
                  <span className="text-right font-semibold text-[color:var(--color-text-primary)]">
                    {summary.timeLabel}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[color:var(--color-text-secondary)]">
                    Durasi
                  </span>
                  <span className="text-right font-semibold text-[color:var(--color-text-primary)]">
                    {summary.durationLabel}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[color:var(--color-text-secondary)]">
                    Peserta
                  </span>
                  <span className="text-right font-semibold text-[color:var(--color-text-primary)]">
                    {summary.participantLabel}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[color:var(--color-text-secondary)]">
                    Tujuan
                  </span>
                  <span className="max-w-[180px] text-right font-semibold text-[color:var(--color-text-primary)]">
                    {summary.purposeLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-[color:var(--color-accent)] px-4 py-3 text-[color:var(--color-primary)]">
                <Info className="mt-0.5 size-4" />
                <p className="text-sm leading-6">
                  Pengajuan akan diverifikasi admin. Backend tetap menjadi
                  keputusan final untuk validasi konflik, kapasitas, dan jam
                  operasional.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="size-4 text-[color:var(--color-primary)]" />
              <h4 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                Ketersediaan Tanggal Ini
              </h4>
            </div>

            {availabilityQuery.isLoading ? (
              <LoadingSkeleton lines={3} showHeader={false} />
            ) : availabilityQuery.isError ? (
              <ErrorState
                description="Availability ruangan tidak bisa dimuat untuk ringkasan form ini."
                actionLabel="Coba Lagi"
                onAction={() => availabilityQuery.refetch()}
              />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-[color:var(--color-surface-subtle)] px-4 py-3 text-sm">
                  <span className="text-[color:var(--color-text-secondary)]">
                    Status ruangan
                  </span>
                  <RoomStatusBadge
                    status={
                      availabilityQuery.data?.data.room_status ?? room.status
                    }
                  />
                </div>
                <div className="rounded-xl border border-dashed border-[color:var(--color-border-strong)] px-4 py-3 text-sm text-[color:var(--color-text-secondary)]">
                  {availabilityQuery.data?.data.blocked_slots.length ? (
                    <p>
                      {availabilityQuery.data.data.blocked_slots.length} slot
                      terblokir pada tanggal ini. Periksa lagi jam yang Anda
                      pilih sebelum submit.
                    </p>
                  ) : (
                    <p>Belum ada slot terblokir pada tanggal yang dipilih.</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[color:var(--color-text-secondary)]">
                  <Clock3 className="size-3.5" />
                  <span>
                    Tanggal aktif:{" "}
                    {selectedDate ? formatDateLabel(selectedDate) : "-"}
                  </span>
                </div>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
    </AuthGuard >
  );
}

export function BookingFormClient({
  roomId,
  initialDate,
}: BookingFormClientProps) {
  if (!roomId) {
    return (
      <AuthGuard allowedRoles={["MAHASISWA"]}>
        <ErrorState
          description="Form booking memerlukan `roomId` dari halaman detail ruangan."
        />
      </AuthGuard>
    );
  }

  return (
    <BookingFormContent
      roomId={roomId}
      initialDate={initialDate ?? getTodayInputValue()}
    />
  );
}
