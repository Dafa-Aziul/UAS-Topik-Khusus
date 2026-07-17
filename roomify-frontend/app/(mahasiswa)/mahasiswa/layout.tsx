import { AppShell } from "@/components/app/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function MahasiswaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["MAHASISWA"]}>
      <AppShell title="Area Mahasiswa">{children}</AppShell>
    </AuthGuard>
  );
}
