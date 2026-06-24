// funciones de autenticacion
import { api } from "./client";
import type { User } from "../types/api.types";

export async function loginUser(email: string, password: string) {
  const res = await api.post("/auth/login/", { email, password });
  return res.data as { status: string; message: string };
}

export async function getMe(email: string) {
  const res = await api.get(`/auth/me/?email=${encodeURIComponent(email)}`);
  return res.data.user as User;
}

export async function registerUser(data: {
  name: string;
  email: string;
  rut: string;
  password: string;
}) {
  const res = await api.post("/auth/register/", data);
  return res.data as { status: string; message: string; user: User };
}
