import { AppShell } from "@/components/app/app-shell";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <AppShell title="Area Admin">{children}</AppShell>
    </AuthGuard>
  );
}
