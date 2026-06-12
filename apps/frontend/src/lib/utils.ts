import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateRut(rut: string): boolean {
  const cleaned = rut.replace(/[.\-]/g, "").toUpperCase();
  if (cleaned.length < 2) return false;
  const body = cleaned.slice(0, -1);
  const dv   = cleaned.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  let sum = 0, mult = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const exp = 11 - (sum % 11);
  return dv === (exp === 11 ? "0" : exp === 10 ? "K" : String(exp));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const s = ["B","KB","MB","GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${s[i]}`;
}
