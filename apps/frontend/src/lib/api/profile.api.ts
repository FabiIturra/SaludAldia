// funciones de perfil medico
import { api } from "./client";
import type { MedicalProfile } from "../types/api.types";

export async function getProfile(email: string) {
  const res = await api.get(`/auth/profile/?email=${encodeURIComponent(email)}`);
  return res.data.user as MedicalProfile;
}

export async function updateProfile(email: string, data: Partial<MedicalProfile>) {
  const res = await api.put(`/auth/profile/?email=${encodeURIComponent(email)}`, data);
  return res.data.profile as MedicalProfile;
}
