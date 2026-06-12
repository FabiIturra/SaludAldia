// Valida RUT chileno (ej: 12.345.678-9 o 12345678-9)
export function validateRut(rut: string): boolean {
  const c = rut.replace(/[.\-]/g, "").toUpperCase();
  if (c.length < 2 || !/^\d+[0-9K]$/.test(c)) return false;
  const body = c.slice(0, -1);
  const dv   = c.slice(-1);
  let sum = 0, mult = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const exp = 11 - (sum % 11);
  return dv === (exp === 11 ? "0" : exp === 10 ? "K" : String(exp));
}

export function formatRut(rut: string): string {
  const c = rut.replace(/[.\-]/g, "").toUpperCase();
  if (c.length < 2) return rut;
  return `${c.slice(0, -1).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${c.slice(-1)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const s = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${s[i]}`;
}

export function isTokenExpired(expiresAt: string): boolean {
  return new Date() > new Date(expiresAt);
}
