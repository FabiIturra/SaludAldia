// tipos compartidos para la api del backend

export interface User {
  id: string;
  email: string;
  name: string;
  rut: string | null;
}

export interface MedicalProfile {
  first_name: string;
  last_name: string;
  birthdate: string;
  genre: string;
  blood_type: string;
  weight: number;
  height: number;
  profile_image: string;
  allergies: string;
  chronic_conditions: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  address?: string;
  current_medications?: string;
  phone?: string;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
}

export interface ApiMedicalDocument {
  id: string;
  title: string;
  document_type: string;
  document_date: string | null;
  medical_center: string | null;
  doctor_name: string | null;
  favorite: boolean;
  specialty: string | null;
  file_url: string | null;
  file_key?: string;
  mime_type?: string | null;
  file_size_bytes?: number | null;
  summary?: string | null;
}

// respuesta generica del backend
export interface ApiResponse<T = unknown> {
  status: string;
  message: string;
  [key: string]: T | string | unknown;
}
