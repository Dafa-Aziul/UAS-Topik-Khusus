import {
  Building2,
  ClipboardList,
  History,
  LayoutDashboard,
  ScrollText,
  Search,
  UserRound,
} from "lucide-react";

import type { NavigationItem } from "@/types/navigation";
import type { UserRole } from "@/types/auth";

export const navigationItems: NavigationItem[] = [
  {
    href: "/mahasiswa/dashboard",
    label: "Dashboard",
    shortLabel: "Dashboard",
    icon: LayoutDashboard,
    roles: ["MAHASISWA"],
  },
  {
    href: "/mahasiswa/rooms",
    label: "Cari Ruangan",
    shortLabel: "Ruangan",
    icon: Search,
    roles: ["MAHASISWA"],
  },
  {
    href: "/mahasiswa/bookings",
    label: "Peminjaman Saya",
    shortLabel: "Booking",
    icon: History,
    roles: ["MAHASISWA"],
  },
  {
    href: "/mahasiswa/profile",
    label: "Profil",
    shortLabel: "Profil",
    icon: UserRound,
    roles: ["MAHASISWA"],
  },
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    shortLabel: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN"],
  },
  {
    href: "/admin/rooms",
    label: "Ruangan",
    shortLabel: "Ruangan",
    icon: Building2,
    roles: ["ADMIN"],
  },
  {
    href: "/admin/bookings",
    label: "Peminjaman",
    shortLabel: "Booking",
    icon: ClipboardList,
    roles: ["ADMIN"],
  },
  {
    href: "/admin/activity-logs",
    label: "Activity Log",
    shortLabel: "Log",
    icon: ScrollText,
    roles: ["ADMIN"],
  },
];

export function getNavigationByRole(role: UserRole) {
  return navigationItems.filter((item) => item.roles.includes(role));
}

export function isNavigationItemActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getSectionLabelByPath(pathname: string, role: UserRole) {
  const items = getNavigationByRole(role);
  const matchedItem = items
    .filter((item) => isNavigationItemActive(pathname, item.href))
    .sort((left, right) => right.href.length - left.href.length)[0];

  return matchedItem?.label ?? getRoleShellTitle(role);
}

export function getRoleLabel(role: UserRole) {
  return role === "ADMIN" ? "Admin Portal" : "Area Mahasiswa";
}

export function getRoleShellTitle(role: UserRole) {
  return role === "ADMIN" ? "Dashboard Admin" : "Dashboard Mahasiswa";
}
