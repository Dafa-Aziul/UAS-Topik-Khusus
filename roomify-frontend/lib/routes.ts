import type { UserRole } from "@/types/auth";

export function getDefaultRouteByRole(role: UserRole) {
  return role === "ADMIN" ? "/admin/dashboard" : "/mahasiswa/dashboard";
}
