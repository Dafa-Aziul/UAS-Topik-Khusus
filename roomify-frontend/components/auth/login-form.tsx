"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Building2, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { login, getCurrentUser, getApiErrorMessage } from "@/lib/auth";
import { getDefaultRouteByRole } from "@/lib/routes";
import { loginSchema, type LoginSchema } from "@/schemas/auth-schema";
import { useAuthStore } from "@/store/auth-store";
import { GuestGuard } from "@/components/auth/guest-guard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const setSession = useAuthStore((state) => state.setSession);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginSchema) => {
      const loginResult = await login(values);
      const accessToken = loginResult.data.access_token;
      const meResult = await getCurrentUser(accessToken);

      return {
        accessToken,
        user: meResult.data,
      };
    },
    onSuccess: ({ accessToken, user }) => {
      setSession({ accessToken, user });
      toast.success("Login berhasil. Sesi awal sudah tersimpan di frontend.");
      router.replace(getDefaultRouteByRole(user.role));
    },
  });

  const errorMessage = loginMutation.isError
    ? getApiErrorMessage(loginMutation.error)
    : null;

  const onSubmit = form.handleSubmit(async (values) => {
    await loginMutation.mutateAsync(values);
  });

  return (
    <GuestGuard>
      <main className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)]">
        <section className="relative hidden w-1/2 overflow-hidden bg-[linear-gradient(160deg,#1d4ed8_0%,#2563eb_46%,#0f172a_100%)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0">
            <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="absolute inset-y-0 right-16 w-px bg-white/10" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                <Building2 className="size-8" />
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-tight">Roomify</p>
                <p className="mt-1 text-sm uppercase tracking-[0.3em] text-white/70">
                  Admin Portal
                </p>
              </div>
            </div>

            <div className="mt-16 max-w-xl">
              <h1 className="text-5xl leading-tight font-semibold">
                Sistem peminjaman ruangan kampus yang terintegrasi.
              </h1>
              <p className="mt-6 text-lg leading-8 text-white/78">
                Kelola jadwal kuliah, rapat organisasi, dan ruang diskusi dalam
                satu platform modern yang efisien untuk mahasiswa dan admin.
              </p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-5">
            <div className="rounded-3xl border border-white/10 bg-white/8 p-6 backdrop-blur-sm">
              <p className="text-sm font-semibold">Cepat dan responsif</p>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Booking ruangan dirancang selesai hanya dalam beberapa langkah.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/8 p-6 backdrop-blur-sm">
              <p className="text-sm font-semibold">Terverifikasi</p>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Approval mengikuti aturan kampus dan statusnya tetap transparan.
              </p>
            </div>
          </div>
        </section>

        <section className="flex w-full items-center justify-center px-6 py-10 sm:px-10 lg:w-1/2 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Building2 className="size-7" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-primary">Roomify</p>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Admin Portal
                </p>
              </div>
            </div>

            <Card className="rounded-[28px] border border-[color:var(--color-border-strong)] bg-white/92 shadow-[0_28px_60px_rgba(37,99,235,0.08)] backdrop-blur">
              <CardHeader className="space-y-2 px-8 pt-8">
                <CardTitle className="text-[32px] leading-[40px] font-bold tracking-[-0.025em] text-[color:var(--color-text-primary)]">
                  Selamat Datang
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-[color:var(--color-text-secondary)]">
                  Silakan masuk menggunakan akun civitas akademik Anda.
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                {errorMessage ? (
                  <Alert
                    variant="destructive"
                    className="mb-6 rounded-2xl border-red-200 bg-[color:var(--color-danger-container)] text-[color:var(--color-on-danger-container)]"
                  >
                    <ShieldCheck className="size-4" />
                    <AlertTitle>Login belum berhasil</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                ) : null}

                <form className="space-y-6" onSubmit={onSubmit}>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-semibold text-[color:var(--color-text-secondary)]"
                    >
                      Alamat Email Kampus
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-text-muted)]" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@univ.ac.id"
                        className="h-12 rounded-2xl border-[color:var(--color-border)] bg-white pl-11 pr-4 text-sm shadow-none focus-visible:border-[color:var(--color-primary)] focus-visible:ring-[color:var(--color-focus-ring)]/40"
                        {...form.register("email")}
                      />
                    </div>
                    {form.formState.errors.email ? (
                      <p className="text-sm text-[color:var(--color-danger)]">
                        {form.formState.errors.email.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-sm font-semibold text-[color:var(--color-text-secondary)]"
                      >
                        Kata Sandi
                      </Label>
                      <button
                        type="button"
                        className="text-sm font-semibold text-[color:var(--color-primary)] transition hover:text-[color:var(--color-primary-hover)]"
                      >
                        Lupa sandi?
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[color:var(--color-text-muted)]" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan kata sandi"
                        className="h-12 rounded-2xl border-[color:var(--color-border)] bg-white pl-11 pr-12 text-sm shadow-none focus-visible:border-[color:var(--color-primary)] focus-visible:ring-[color:var(--color-focus-ring)]/40"
                        {...form.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)] transition hover:text-[color:var(--color-text-primary)]"
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {form.formState.errors.password ? (
                      <p className="text-sm text-[color:var(--color-danger)]">
                        {form.formState.errors.password.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2 pt-2">
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 w-full rounded-2xl bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-hover)]"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Memproses..." : "Masuk"}
                      <ArrowRight className="size-4" />
                    </Button>
                    <p className=" text-center text-sm text-[color:var(--color-text-secondary)]">
                      Belum punya akun?{" "}
                      <Link
                        href="/register"
                        className="font-semibold text-[color:var(--color-primary)] underline underline-offset-4"
                      >
                        Daftar
                      </Link>
                    </p>
                  </div>


                </form>

                <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-subtle)] px-4 py-2 text-xs text-[color:var(--color-text-secondary)]">
                  <ShieldCheck className="size-4 text-[color:var(--color-success)]" />
                  Data terenkripsi dan terhubung langsung ke server kampus.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </GuestGuard>
  );
}
