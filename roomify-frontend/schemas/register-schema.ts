import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(3, "Nama lengkap minimal 3 karakter."),
    nim: z
      .string()
      .min(8, "NIM minimal 8 digit.")
      .regex(/^\d+$/, "NIM hanya boleh berisi angka."),
    email: z
      .string()
      .min(1, "Email wajib diisi.")
      .email("Masukkan alamat email yang valid."),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter.")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        "Password harus mengandung huruf dan angka.",
      ),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Konfirmasi password harus sama.",
    path: ["confirmPassword"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
