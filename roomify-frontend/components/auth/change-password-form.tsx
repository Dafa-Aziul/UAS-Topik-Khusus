"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { changePassword, getApiErrorMessage } from "@/lib/auth";
import {
  changePasswordSchema,
  type ChangePasswordSchema,
} from "@/schemas/change-password-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (values: ChangePasswordSchema) =>
      changePassword({
        current_password: values.currentPassword,
        new_password: values.newPassword,
      }),
    onSuccess: () => {
      form.reset();
      toast.success("Password berhasil diperbarui.");
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await changePasswordMutation.mutateAsync(values);
  });

  const errorMessage = changePasswordMutation.isError
    ? getApiErrorMessage(changePasswordMutation.error)
    : null;

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-[color:var(--color-danger-container)] px-4 py-3 text-sm text-[color:var(--color-on-danger-container)]">
          {errorMessage}
        </div>
      ) : null}

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="currentPassword"
              className="text-sm font-semibold text-[color:var(--color-text-primary)]"
            >
              Password Saat Ini
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                className="h-12 rounded-xl border-[color:var(--color-border)] bg-white pr-12 shadow-none focus-visible:border-[color:var(--color-primary)] focus-visible:ring-[color:var(--color-focus-ring)]/40"
                {...form.register("currentPassword")}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)] transition hover:text-[color:var(--color-text-primary)]"
                aria-label={
                  showCurrentPassword
                    ? "Sembunyikan password saat ini"
                    : "Tampilkan password saat ini"
                }
              >
                {showCurrentPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {form.formState.errors.currentPassword ? (
              <p className="text-sm text-[color:var(--color-danger)]">
                {form.formState.errors.currentPassword.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="newPassword"
              className="text-sm font-semibold text-[color:var(--color-text-primary)]"
            >
              Password Baru
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                className="h-12 rounded-xl border-[color:var(--color-border)] bg-white pr-12 shadow-none focus-visible:border-[color:var(--color-primary)] focus-visible:ring-[color:var(--color-focus-ring)]/40"
                {...form.register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)] transition hover:text-[color:var(--color-text-primary)]"
                aria-label={
                  showNewPassword
                    ? "Sembunyikan password baru"
                    : "Tampilkan password baru"
                }
              >
                {showNewPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {form.formState.errors.newPassword ? (
              <p className="text-sm text-[color:var(--color-danger)]">
                {form.formState.errors.newPassword.message}
              </p>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmNewPassword"
            className="text-sm font-semibold text-[color:var(--color-text-primary)]"
          >
            Konfirmasi Password Baru
          </Label>
          <div className="relative">
            <Input
              id="confirmNewPassword"
              type={showConfirmPassword ? "text" : "password"}
              className="h-12 rounded-xl border-[color:var(--color-border)] bg-white pr-12 shadow-none focus-visible:border-[color:var(--color-primary)] focus-visible:ring-[color:var(--color-focus-ring)]/40"
              {...form.register("confirmNewPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)] transition hover:text-[color:var(--color-text-primary)]"
              aria-label={
                showConfirmPassword
                  ? "Sembunyikan konfirmasi password baru"
                  : "Tampilkan konfirmasi password baru"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {form.formState.errors.confirmNewPassword ? (
            <p className="text-sm text-[color:var(--color-danger)]">
              {form.formState.errors.confirmNewPassword.message}
            </p>
          ) : null}
        </div>

        <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-4 text-[color:var(--color-success)]" />
            <div>
              <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                Rekomendasi keamanan
              </p>
              <p className="mt-1 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                Gunakan password baru yang mengandung huruf dan angka, lalu
                hindari memakai kombinasi yang sama dengan akun lain.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-[color:var(--color-border)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
            Setelah disimpan, password baru akan dipakai untuk login berikutnya.
          </p>
          <Button
            type="submit"
            size="lg"
            className="h-11 rounded-xl bg-[color:var(--color-primary)] px-5 hover:bg-[color:var(--color-primary-hover)] sm:w-auto"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending
              ? "Menyimpan..."
              : "Simpan Password Baru"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
