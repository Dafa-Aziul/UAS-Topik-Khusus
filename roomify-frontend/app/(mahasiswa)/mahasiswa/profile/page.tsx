"use client";

import { LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { PageHeader } from "@/components/layout/page-header";
import { useAuthStore } from "@/store/auth-store";

function ProfileContent() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return null;
  }

  return (
    <section className="space-y-6">
      <PageHeader
        title="Profil"
        description="Kelola informasi akun mahasiswa dan perbarui keamanan akses Roomify Anda."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-[color:var(--color-border-strong)] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-16 items-center justify-center rounded-3xl bg-[color:var(--color-accent)] text-[color:var(--color-primary)]">
              <UserRound className="size-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                {user.name}
              </h2>
              <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                {user.role === "MAHASISWA" ? "Mahasiswa Aktif" : "Administrator"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-[color:var(--color-surface-subtle)] p-5">
              <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                Email
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                {user.email}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-[color:var(--color-surface-subtle)] p-5">
              <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                NIM
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                {user.nim ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[color:var(--color-border-strong)] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
          <h3 className="text-xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
            Status Akun
          </h3>
          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3 rounded-[1.5rem] bg-[color:var(--color-surface-subtle)] p-5">
              <Mail className="mt-1 size-5 text-[color:var(--color-primary)]" />
              <div>
                <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                  Kontak utama
                </p>
                <p className="mt-1 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Email login aktif digunakan sebagai identitas akun Roomify.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-[1.5rem] bg-[color:var(--color-surface-subtle)] p-5">
              <ShieldCheck className="mt-1 size-5 text-[color:var(--color-success)]" />
              <div>
                <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                  Status keamanan
                </p>
                <p className="mt-1 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  {user.is_active === false
                    ? "Akun sedang nonaktif."
                    : "Akun aktif dan siap digunakan untuk fitur utama Roomify."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] border border-[color:var(--color-border-strong)] bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="mb-5 flex items-start gap-3 sm:mb-6 sm:items-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[color:var(--color-primary-container)] text-[color:var(--color-primary)]">
            <LockKeyhole className="size-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
              Keamanan Akun
            </h3>
            <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
              Perbarui password Anda langsung dari halaman profil.
            </p>
          </div>
        </div>

        <ChangePasswordForm />
      </div>
    </section>
  );
}

export default function MahasiswaProfilePage() {
  return (
    <AuthGuard allowedRoles={["MAHASISWA"]}>
      <ProfileContent />
    </AuthGuard>
  );
}
