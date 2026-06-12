// Tipos compartidos entre frontend y cualquier otra app del monorepo

export type MedicalDocumentType =
  | "Examen" | "Receta" | "Informe" | "Diagnóstico"
  | "Imagenología" | "Certificado" | "Epicrisis"
  | "Licencia" | "Consentimiento" | "Otro";

export type BloodType = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";

export type Priority = "critical" | "high" | "medium" | "low";

export interface User {
  id: string;
  email: string;
  rut: string | null;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
}

export interface MedicalProfile {
  firstName: string;
  lastName: string;
  birthdate: string | null;
  genre: string;
  bloodType: BloodType | null;
  weight: number | null;
  height: number | null;
  allergies: string;
  chronicConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export interface Document {
  id: string;
  title: string;
  type: MedicalDocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  issuer: string;
  healthCenter: string | null;
  issuedAt: string | null;
  createdAt: string;
}

export interface ScanResult {
  imageUrl: string;
  quality: "excellent" | "good" | "acceptable" | "poor" | "very_poor";
  lossPercent: number;
}
