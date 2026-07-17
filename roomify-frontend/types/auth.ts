export type UserRole = "MAHASISWA" | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  nim?: string | null;
  is_active?: boolean;
};
