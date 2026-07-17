import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(8, "Password saat ini minimal 8 karakter."),
    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter.")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        "Password baru harus mengandung huruf dan angka.",
      ),
    confirmNewPassword: z
      .string()
      .min(1, "Konfirmasi password baru wajib diisi."),
  })
  .refine((value) => value.newPassword === value.confirmNewPassword, {
    message: "Konfirmasi password baru harus sama.",
    path: ["confirmNewPassword"],
  });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
