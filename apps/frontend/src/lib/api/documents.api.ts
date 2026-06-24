// funciones de documentos medicos
import { api } from "./client";
import type { ApiMedicalDocument, DocumentCategory } from "../types/api.types";

export async function getDocuments(email: string) {
  const res = await api.get(`/documents/?email=${encodeURIComponent(email)}`);
  return res.data.documents as ApiMedicalDocument[];
}

export async function createDocument(email: string, formData: FormData) {
  const res = await api.post(
    `/documents/?email=${encodeURIComponent(email)}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data as { status: string; message: string; document_id: string };
}

export async function deleteDocument(documentId: string, email: string) {
  const res = await api.delete(
    `/documents/${documentId}/?email=${encodeURIComponent(email)}`
  );
  return res.data as { status: string; message: string };
}

export async function getCategories() {
  const res = await api.get("/documents/categories/");
  return res.data.categories as DocumentCategory[];
}


// tipo visual usado en el frontend
export type UiDocumentType = "EXAMENES" | "RECETA" | "LICENCIA";

// mapea document_type del backend al tipo visual del frontend
const API_TYPE_MAP: Record<string, UiDocumentType> = {
  exam: "EXAMENES",
  report: "EXAMENES",
  vaccine: "EXAMENES",
  other: "EXAMENES",
  prescription: "RECETA",
  sick_leave: "LICENCIA",
};

export function mapApiDocType(apiType: string): UiDocumentType {
  return API_TYPE_MAP[apiType] ?? "EXAMENES";
}
