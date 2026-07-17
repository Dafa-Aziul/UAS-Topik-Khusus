"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  Mail,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { getApiErrorMessage, register } from "@/lib/auth";
import { type RegisterSchema, registerSchema } from "@/schemas/register-schema";
import { GuestGuard } from "@/components/auth/guest-guard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldProps = {
  id: keyof RegisterSchema;
  label: string;
  placeholder: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  hint?: string;
  error?: string;
  register: ReturnType<typeof useForm<RegisterSchema>>["register"];
  showToggle?: boolean;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
};

function RegisterField({
  id,
  label,
  placeholder,
  icon: Icon,
  type = "text",
  inputMode,
  hint,
  error,
  register,
  showToggle = false,
  isVisible = false,
  onToggleVisibility,
}: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-sm font-semibold text-[color:var(--color-text-primary)]"
      >
        {label}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-text-muted)]" />
        <Input
          id={id}
          type={showToggle ? (isVisible ? "text" : "password") : type}
          inputMode={inputMode}
          placeholder={placeholder}
          className={`h-12 rounded-xl border-[color:var(--color-border)] bg-white pl-11 shadow-none focus-visible:border-[color:var(--color-primary)] focus-visible:ring-[color:var(--color-focus-ring)]/40 ${showToggle ? "pr-12" : "pr-4"}`}
          {...register(id)}
        />
        {showToggle ? (
          <button
            type="button"
            onClick={onToggleVisibility}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)] transition hover:text-[color:var(--color-text-primary)]"
            aria-label={
              isVisible
                ? `Sembunyikan ${label.toLowerCase()}`
                : `Tampilkan ${label.toLowerCase()}`
            }
          >
            {isVisible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        ) : null}
      </div>
      {hint ? (
        <p className="text-[11px] leading-5 text-[color:var(--color-text-secondary)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-[color:var(--color-danger)]">{error}</p>
      ) : null}
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      nim: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = useDeferredValue(
    useWatch({ control: form.control, name: "password", defaultValue: "" }),
  );
  const confirmPassword = useDeferredValue(
    useWatch({
      control: form.control,
      name: "confirmPassword",
      defaultValue: "",
    }),
  );

  const registerMutation = useMutation({
    mutationFn: (values: RegisterSchema) =>
      register({
        name: values.name,
        nim: values.nim,
        email: values.email,
        password: values.password,
      }),
    onSuccess: () => {
      toast.success("Registrasi berhasil. Silakan masuk menggunakan akun baru.");
      router.replace("/login");
    },
  });

  const errorMessage = registerMutation.isError
    ? getApiErrorMessage(registerMutation.error)
    : null;

  const onSubmit = form.handleSubmit(async (values) => {
    await registerMutation.mutateAsync(values);
  });

  const passwordLongEnough = password.length >= 8;
  const passwordMatches =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  return (
    <GuestGuard>
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.16),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(213,227,252,0.42),_transparent_30%),linear-gradient(180deg,#faf8ff_0%,#f8fafc_100%)] px-4 py-8 md:px-8">
        <div className="grid w-full max-w-[1000px] overflow-hidden rounded-[1.5rem] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] shadow-[0_24px_64px_rgba(15,23,42,0.1)] md:grid-cols-2">
          <section className="relative hidden overflow-hidden bg-[linear-gradient(180deg,#004ac6_0%,#1d4ed8_45%,#0f172a_100%)] p-12 text-white md:flex md:flex-col md:justify-between">
            <div className="relative z-10">
              <div className="mb-10 flex items-center gap-3">
                <Building2 className="size-10" />
                <h1 className="text-3xl font-semibold tracking-tight">
                  Roomify
                </h1>
              </div>
              <h2 className="max-w-md text-5xl leading-tight font-bold tracking-[-0.03em]">
                Kelola ruang belajarmu lebih cepat.
              </h2>
              <p className="mt-6 max-w-md text-base leading-8 text-white/85">
                Akses eksklusif untuk mahasiswa Universitas. Daftarkan diri Anda
                menggunakan NIM untuk mulai meminjam ruang kelas, lab, dan
                fasilitas kampus lainnya secara online.
              </p>
            </div>

            <div className="relative z-10 rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 size-5 text-sky-100" />
                <p className="text-sm leading-7 text-white/85">
                  Akun ini khusus untuk profil Mahasiswa Aktif. Gunakan email
                  institusi jika tersedia.
                </p>
              </div>
            </div>

            <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -left-12 top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          </section>

          <section className="flex flex-col justify-center p-8 md:p-12">
            <div className="mb-8 md:hidden">
              <div className="flex items-center gap-3">
                <Building2 className="size-8 text-[color:var(--color-primary)]" />
                <h1 className="text-2xl font-semibold text-[color:var(--color-primary)]">
                  Roomify
                </h1>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                Daftar Akun Baru
              </h2>
              <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                Lengkapi data diri Anda di bawah ini.
              </p>
            </div>

            {errorMessage ? (
              <Alert className="mb-6 rounded-xl border-red-200 bg-[color:var(--color-danger-container)] text-[color:var(--color-on-danger-container)]">
                <ShieldCheck className="size-4" />
                <AlertTitle>Registrasi belum berhasil</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            <form className="space-y-5" onSubmit={onSubmit}>
              <RegisterField
                id="name"
                label="Nama Lengkap"
                placeholder="Nama sesuai KHS"
                icon={UserRound}
                error={form.formState.errors.name?.message}
                register={form.register}
              />

              <RegisterField
                id="nim"
                label="NIM (Nomor Induk Mahasiswa)"
                placeholder="Contoh: 2101012345"
                icon={IdCard}
                inputMode="numeric"
                hint="Hanya angka. Digunakan untuk validasi status kemahasiswaan."
                error={form.formState.errors.nim?.message}
                register={form.register}
              />

              <RegisterField
                id="email"
                label="Email"
                placeholder="nama@student.univ.ac.id"
                icon={Mail}
                type="email"
                error={form.formState.errors.email?.message}
                register={form.register}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <RegisterField
                  id="password"
                  label="Password"
                  placeholder="Min. 8 karakter"
                  icon={Lock}
                  type="password"
                  showToggle
                  isVisible={showPassword}
                  onToggleVisibility={() => setShowPassword((value) => !value)}
                  error={form.formState.errors.password?.message}
                  register={form.register}
                />

                <RegisterField
                  id="confirmPassword"
                  label="Konfirmasi"
                  placeholder="Ulangi password"
                  icon={ShieldCheck}
                  type="password"
                  showToggle
                  isVisible={showConfirmPassword}
                  onToggleVisibility={() =>
                    setShowConfirmPassword((value) => !value)
                  }
                  error={form.formState.errors.confirmPassword?.message}
                  register={form.register}
                />
              </div>

              <div className="rounded-xl bg-[color:var(--color-surface-subtle)] p-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2
                    className={
                      passwordLongEnough
                        ? "size-4 text-[color:var(--color-success)]"
                        : "size-4 text-[color:var(--color-text-muted)]"
                    }
                  />
                  <span className="text-[color:var(--color-text-secondary)]">
                    Minimal 8 karakter
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <CheckCircle2
                    className={
                      passwordMatches
                        ? "size-4 text-[color:var(--color-success)]"
                        : "size-4 text-[color:var(--color-text-muted)]"
                    }
                  />
                  <span className="text-[color:var(--color-text-secondary)]">
                    Password cocok
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-11 w-full rounded-lg bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-hover)]"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending
                  ? "Memproses..."
                  : "Daftar Sekarang"}
                <ArrowRight className="size-4" />
              </Button>
            </form>

            <div className="mt-8 border-t border-[color:var(--color-border)] pt-6 text-center">
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Sudah punya akun mahasiswa?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[color:var(--color-primary)] underline underline-offset-4"
                >
                  Masuk ke Roomify
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>
    </GuestGuard>
  );
}
