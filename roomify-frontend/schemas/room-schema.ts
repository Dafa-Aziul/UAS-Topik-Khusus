import { z } from "zod";

export const roomSchema = z.object({
  code: z.string().min(2, "Kode ruangan minimal 2 karakter."),
  name: z.string().min(3, "Nama ruangan minimal 3 karakter."),
  building: z.string().min(2, "Gedung wajib diisi."),
  floor: z.coerce.number().int("Lantai harus angka bulat."),
  location_description: z
    .string()
    .min(3, "Deskripsi lokasi minimal 3 karakter."),
  capacity: z.coerce
    .number()
    .int("Kapasitas harus angka bulat.")
    .min(1, "Kapasitas minimal 1."),
  facilities_input: z.string().min(2, "Masukkan minimal satu fasilitas."),
  description: z.string().min(5, "Deskripsi minimal 5 karakter."),
  status: z.enum(["AVAILABLE", "MAINTENANCE", "INACTIVE"]),
});

export type RoomSchemaInput = z.input<typeof roomSchema>;
export type RoomSchema = z.output<typeof roomSchema>;
