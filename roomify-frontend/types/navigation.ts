import type { LucideIcon } from "lucide-react";

import type { UserRole } from "@/types/auth";

export type NavigationItem = {
  href: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  roles: UserRole[];
};
