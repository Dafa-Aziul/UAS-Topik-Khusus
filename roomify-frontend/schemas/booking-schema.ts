import { z } from "zod";

const MIN_BOOKING_DURATION_MINUTES = 30;
const MAX_BOOKING_DURATION_MINUTES = 8 * 60;
const OPERATING_START_TIME = "07:00";
const OPERATING_END_TIME = "21:00";

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export const bookingSchema = z
  .object({
    booking_date: z
      .string()
      .min(1, "Tanggal kegiatan wajib dipilih.")
      .refine((value) => value >= "2026-07-16", {
        message: "Tanggal kegiatan tidak boleh di masa lalu.",
      }),
    participant_count: z.coerce
      .number()
      .int("Jumlah peserta harus berupa angka bulat.")
      .min(1, "Jumlah peserta minimal 1 orang."),
    start_time: z.string().min(1, "Waktu mulai wajib diisi."),
    end_time: z.string().min(1, "Waktu selesai wajib diisi."),
    purpose: z.string().min(5, "Tujuan kegiatan minimal 5 karakter."),
    user_note: z.string().optional(),
  })
  .refine((value) => value.end_time > value.start_time, {
    message: "Waktu selesai harus setelah waktu mulai.",
    path: ["end_time"],
  })
  .refine(
    (value) =>
      toMinutes(value.start_time) >= toMinutes(OPERATING_START_TIME) &&
      toMinutes(value.end_time) <= toMinutes(OPERATING_END_TIME),
    {
      message: "Jam peminjaman harus berada di rentang 07:00 sampai 21:00.",
      path: ["start_time"],
    },
  )
  .refine(
    (value) =>
      toMinutes(value.end_time) - toMinutes(value.start_time) >=
      MIN_BOOKING_DURATION_MINUTES,
    {
      message: "Durasi peminjaman minimal 30 menit.",
      path: ["end_time"],
    },
  )
  .refine(
    (value) =>
      toMinutes(value.end_time) - toMinutes(value.start_time) <=
      MAX_BOOKING_DURATION_MINUTES,
    {
      message: "Durasi peminjaman maksimal 8 jam.",
      path: ["end_time"],
    },
  )
  .refine((value) => value.booking_date <= "2026-10-14", {
    message: "Tanggal peminjaman maksimal 90 hari dari hari ini.",
    path: ["booking_date"],
  });

export type BookingSchemaInput = z.input<typeof bookingSchema>;
export type BookingSchema = z.output<typeof bookingSchema>;
