import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi.")
    .email("Masukkan alamat email kampus yang valid."),
  password: z.string().min(8, "Kata sandi minimal 8 karakter."),
});

export type LoginSchema = z.infer<typeof loginSchema>;
