import { isAxiosError } from "axios";

import { api } from "@/lib/axios";
import type { ChangePasswordSchema } from "@/schemas/change-password-schema";
import type { LoginSchema } from "@/schemas/auth-schema";
import type { RegisterSchema } from "@/schemas/register-schema";
import type { ApiEnvelope, ApiErrorEnvelope } from "@/types/api";
import type { AuthUser } from "@/types/auth";

type LoginResponse = ApiEnvelope<{
  access_token: string;
  token_type: string;
}>;

type MeResponse = ApiEnvelope<AuthUser>;

type RefreshResponse = ApiEnvelope<{
  access_token: string;
  token_type: string;
}>;

type RegisterPayload = Omit<RegisterSchema, "confirmPassword">;

type RegisterResponse = ApiEnvelope<AuthUser>;

export async function login(payload: LoginSchema) {
  const response = await api.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

export async function register(payload: RegisterPayload) {
  const response = await api.post<RegisterResponse>("/auth/register", payload);
  return response.data;
}

export async function getCurrentUser(accessToken: string) {
  const response = await api.get<MeResponse>("/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}

export async function refreshSession() {
  const response = await api.post<RefreshResponse>("/auth/refresh");
  return response.data;
}

export async function logout() {
  const response = await api.post<ApiEnvelope<null>>("/auth/logout");
  return response.data;
}

export async function changePassword(payload: {
  current_password: ChangePasswordSchema["currentPassword"];
  new_password: ChangePasswordSchema["newPassword"];
}) {
  const response = await api.patch<ApiEnvelope<null>>(
    "/auth/change-password",
    payload,
  );
  return response.data;
}

export function getApiErrorMessage(error: unknown) {
  if (isAxiosError<ApiErrorEnvelope>(error)) {
    if (!error.response) {
      return "Koneksi gagal. Periksa jaringan Anda lalu coba lagi.";
    }

    return (
      error.response?.data?.message ??
      "Permintaan tidak dapat diproses. Silakan coba lagi."
    );
  }

  return "Terjadi kesalahan yang tidak terduga.";
}

export function getApiErrorCode(error: unknown) {
  if (isAxiosError<ApiErrorEnvelope>(error)) {
    return error.response?.data?.error?.code ?? null;
  }

  return null;
}
