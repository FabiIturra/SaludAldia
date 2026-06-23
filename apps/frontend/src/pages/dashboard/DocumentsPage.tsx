import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Download,
  Eye,
  Lightbulb,
  Plus,
  Share2,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import documentsRobot from "@/assets/img/robot.png";
import documentsSecurity from "@/assets/img/fondo-seguridad.png";
import iconExam from "@/assets/img/icono-examenes.png";
import iconPrescription from "@/assets/img/icono-recetas.png";
import iconLicense from "@/assets/img/icono-licencias.png";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth.store";

type DocumentGroup = "Examenes" | "Recetas Medicas" | "Certificados";
type DocumentType = "EXAMENES" | "RECETA" | "LICENCIA";
type ApiDocumentType =
  | "exam"
  | "prescription"
  | "sick_leave"
  | "report"
  | "vaccine"
  | "other"
  | DocumentType;
type TabOption = "TODOS" | "EXAMENES" | "RECETA" | "LICENCIA";
type FilterOption = "favorites" | "center" | "specialty" | "doctor" | null;
type SortOption = "newest" | "oldest" | "name";

type SupabaseDocumentRecord = {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  doc_type: ApiDocumentType;
  file_key: string;
  file_url: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  document_date: string | null;
  issuing_institution: string | null;
  issuing_professional: string | null;
  ai_metadata: Record<string, unknown> | null;
  created_at: string;
  deleted_at: string | null;
  medical_center?: string | null;
  specialty?: string | null;
  doctor_name?: string | null;
  is_favorite?: boolean;
};

type MedicalDocument = {
  id: string;
  group: DocumentGroup;
  title: string;
  type: DocumentType;
  date: string;
  isoDate: string;
  icon: string;
  center: string;
  specialty: string;
  doctor: string;
  favorite: boolean;
  summary: string;
  userId: string;
  categoryId: string | null;
  fileKey: string;
  fileUrl: string | null;
  mimeType: string | null;
  fileSizeBytes: number | null;
  createdAt: string;
  deletedAt: string | null;
  aiMetadata: Record<string, unknown> | null;
};

type DocumentCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
};

const TABS: TabOption[] = ["TODOS", "EXAMENES", "RECETA", "LICENCIA"];

const FILTER_OPTIONS = [
  // Opciones del dropdown "Filtrar Por"; aplican criterios rapidos a la lista.
  { label: "Favoritos", value: "favorites" },
  { label: "Centro medico", value: "center" },
  { label: "Especialidad", value: "specialty" },
  { label: "Medico", value: "doctor" },
] satisfies { label: string; value: Exclude<FilterOption, null> }[];

const SORT_OPTIONS = [
  // Opciones del dropdown "Ordenar Por"; controlan el orden visible de documentos.
  { label: "Mas reciente", value: "newest" },
  { label: "Mas antigua", value: "oldest" },
  { label: "De la A-Z", value: "name" },
] satisfies { label: string; value: SortOption }[];

const MOCK_SUPABASE_DOCUMENTS: SupabaseDocumentRecord[] = [
  // Datos mock alineados a la tabla real de Supabase: documents.
  // Cuando exista el endpoint, esta constante se reemplaza por el GET del backend.
  {
    id: "perfil-lipidico",
    user_id: "demo-user-id",
    category_id: null,
    title: "Perfil Lipidico",
    doc_type: "EXAMENES",
    file_key: "documents/demo-user-id/perfil-lipidico.pdf",
    file_url: null,
    mime_type: "application/pdf",
    file_size_bytes: 248000,
    document_date: "2024-10-08",
    issuing_institution: "Red Salud",
    issuing_professional: "Dr. Andres Medina",
    ai_metadata: {
      specialty: "Laboratorio clinico",
      favorite: true,
      summary: "Examen de colesterol total, HDL, LDL y trigliceridos.",
    },
    created_at: "2024-10-08T12:00:00Z",
    deleted_at: null,
  },
  {
    id: "hemograma-completo",
    user_id: "demo-user-id",
    category_id: null,
    title: "Hemograma Completo",
    doc_type: "EXAMENES",
    file_key: "documents/demo-user-id/hemograma-completo.pdf",
    file_url: null,
    mime_type: "application/pdf",
    file_size_bytes: 192000,
    document_date: "2024-10-07",
    issuing_institution: "Red Salud",
    issuing_professional: "Dra. Camila Flores",
    ai_metadata: {
      specialty: "Laboratorio clinico",
      favorite: false,
      summary: "Analisis de globulos rojos, blancos, plaquetas y hematocrito.",
    },
    created_at: "2024-10-07T12:00:00Z",
    deleted_at: null,
  },
  {
    id: "resonancia-magnetica",
    user_id: "demo-user-id",
    category_id: null,
    title: "Resonancia Magnetica",
    doc_type: "EXAMENES",
    file_key: "documents/demo-user-id/resonancia-magnetica.pdf",
    file_url: null,
    mime_type: "application/pdf",
    file_size_bytes: 1580000,
    document_date: "2024-09-12",
    issuing_institution: "Integramedica",
    issuing_professional: "Dr. Nicolas Fuentes",
    ai_metadata: {
      specialty: "Imagenologia",
      favorite: false,
      summary: "Estudio de imagen para control y seguimiento medico.",
    },
    created_at: "2024-09-12T12:00:00Z",
    deleted_at: null,
  },
  {
    id: "gripe-estacional-receta",
    user_id: "demo-user-id",
    category_id: null,
    title: "Gripe Estacional - Receta",
    doc_type: "RECETA",
    file_key: "documents/demo-user-id/gripe-estacional-receta.pdf",
    file_url: null,
    mime_type: "application/pdf",
    file_size_bytes: 126000,
    document_date: "2024-06-03",
    issuing_institution: "Red Salud",
    issuing_professional: "Dra. Valentina Rojas",
    ai_metadata: {
      specialty: "Medicina general",
      favorite: false,
      summary: "Indicaciones de tratamiento para sintomas gripales.",
    },
    created_at: "2024-06-03T12:00:00Z",
    deleted_at: null,
  },
  {
    id: "control-hipertension",
    user_id: "demo-user-id",
    category_id: null,
    title: "Control Hipertension",
    doc_type: "RECETA",
    file_key: "documents/demo-user-id/control-hipertension.pdf",
    file_url: null,
    mime_type: "application/pdf",
    file_size_bytes: 141000,
    document_date: "2024-06-25",
    issuing_institution: "Integramedica",
    issuing_professional: "Dra. Paula Herrera",
    ai_metadata: {
      specialty: "Cardiologia",
      favorite: true,
      summary: "Receta e indicaciones para control mensual de hipertension.",
    },
    created_at: "2024-06-25T12:00:00Z",
    deleted_at: null,
  },
  {
    id: "licencia-3-dias",
    user_id: "demo-user-id",
    category_id: null,
    title: "Licencia Medica - 3 dias",
    doc_type: "LICENCIA",
    file_key: "documents/demo-user-id/licencia-3-dias.pdf",
    file_url: null,
    mime_type: "application/pdf",
    file_size_bytes: 97000,
    document_date: "2024-05-23",
    issuing_institution: "Dr. Hector Valenzuela",
    issuing_professional: "Dr. Hector Valenzuela",
    ai_metadata: {
      specialty: "Medicina general",
      favorite: false,
      summary: "Reposo indicado por 3 dias por cuadro respiratorio agudo.",
    },
    created_at: "2024-05-23T12:00:00Z",
    deleted_at: null,
  },
];

const GROUP_ORDER: DocumentGroup[] = [
  "Examenes",
  "Recetas Medicas",
  "Certificados",
];

function formatDate(isoDate: string | null) {
  if (!isoDate) return "Sin fecha";

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date(`${isoDate}T00:00:00`))
    .replace(".", "");
}

function getMetadataText(
  metadata: SupabaseDocumentRecord["ai_metadata"],
  key: string,
  fallback: string
) {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function getMetadataBoolean(
  metadata: SupabaseDocumentRecord["ai_metadata"],
  key: string
) {
  return metadata?.[key] === true;
}

function normalizeDocumentType(type: ApiDocumentType): DocumentType {
  if (type === "prescription" || type === "RECETA") return "RECETA";
  if (type === "sick_leave" || type === "LICENCIA") return "LICENCIA";
  return "EXAMENES";
}

function getDocumentGroup(type: ApiDocumentType): DocumentGroup {
  const normalizedType = normalizeDocumentType(type);
  if (normalizedType === "RECETA") return "Recetas Medicas";
  if (normalizedType === "LICENCIA") return "Certificados";
  return "Examenes";
}

function getDocumentIcon(type: ApiDocumentType) {
  const normalizedType = normalizeDocumentType(type);
  if (normalizedType === "RECETA") return iconPrescription;
  if (normalizedType === "LICENCIA") return iconLicense;
  return iconExam;
}

function getDocTypeByCategory(category: DocumentCategory): ApiDocumentType {
  const slug = category.slug.toLowerCase();
  if (slug.includes("receta")) return "prescription";
  if (slug.includes("licencia") || slug.includes("certificado")) return "sick_leave";
  if (slug.includes("examen")) return "exam";
  return "other";
}

function mapSupabaseDocument(record: SupabaseDocumentRecord): MedicalDocument {
  // Adaptador entre la tabla documents y el modelo que necesita la interfaz.
  return {
    id: record.id,
    group: getDocumentGroup(record.doc_type),
    title: record.title,
    type: normalizeDocumentType(record.doc_type),
    date: formatDate(record.document_date),
    isoDate: record.document_date ?? record.created_at.slice(0, 10),
    icon: getDocumentIcon(record.doc_type),
    center: record.medical_center ?? record.issuing_institution ?? "Sin centro medico",
    specialty:
      record.specialty ??
      getMetadataText(record.ai_metadata, "specialty", "Sin especialidad"),
    doctor: record.doctor_name ?? record.issuing_professional ?? "Sin medico",
    favorite:
      record.is_favorite ??
      getMetadataBoolean(record.ai_metadata, "is_favorite") ??
      getMetadataBoolean(record.ai_metadata, "favorite"),
    summary: getMetadataText(
      record.ai_metadata,
      "summary",
      "Documento medico guardado en Saludaldia."
    ),
    userId: record.user_id,
    categoryId: record.category_id,
    fileKey: record.file_key,
    fileUrl: record.file_url,
    mimeType: record.mime_type,
    fileSizeBytes: record.file_size_bytes,
    createdAt: record.created_at,
    deletedAt: record.deleted_at,
    aiMetadata: record.ai_metadata,
  };
}

const INITIAL_DOCUMENTS = MOCK_SUPABASE_DOCUMENTS.map(mapSupabaseDocument);

function sortDocuments(documents: MedicalDocument[], sortBy: SortOption) {
  return [...documents].sort((a, b) => {
    if (sortBy === "newest") return b.isoDate.localeCompare(a.isoDate);
    if (sortBy === "oldest") return a.isoDate.localeCompare(b.isoDate);
    return a.title.localeCompare(b.title);
  });
}

function downloadDocument(document: MedicalDocument) {
  if (document.fileUrl) {
    window.open(document.fileUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const content = [
    "Saludaldia - Documento medico",
    `Titulo: ${document.title}`,
    `Tipo: ${document.type}`,
    `Fecha: ${document.date}`,
    `Centro medico: ${document.center}`,
    `Especialidad: ${document.specialty}`,
    `Medico: ${document.doctor}`,
    `Archivo: ${document.fileKey}`,
    "",
    document.summary,
  ].join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = `${document.title.toLowerCase().replace(/\s+/g, "-")}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function DocumentsPage() {
  const user = useAuthStore((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabOption>("TODOS");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [pendingSortBy, setPendingSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>(null);
  const [pendingFilterBy, setPendingFilterBy] = useState<FilterOption>(null);
  const [openMenu, setOpenMenu] = useState<"filter" | "sort" | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<MedicalDocument | null>(null);

  useEffect(() => {
    const loadDocuments = async () => {
      if (!user?.email) {
        setDocuments(INITIAL_DOCUMENTS);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get("/documents/", {
          params: { email: user.email },
        });
        const apiDocuments = response.data.documents ?? [];
        setDocuments(apiDocuments.map(mapSupabaseDocument));
      } catch (error) {
        console.error("Error al cargar documentos:", error);
        setDocuments(INITIAL_DOCUMENTS);
        toast.error("No se pudieron cargar documentos reales. Mostrando datos de ejemplo.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [user?.email]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get("/documents/categories/");
        setCategories(response.data.categories ?? []);
      } catch (error) {
        console.error("Error al cargar categorias:", error);
      }
    };

    loadCategories();
  }, []);

  const groupedDocuments = useMemo(() => {
    // Aplica tab, filtro, orden y agrupacion para renderizar la lista final.
    const filteredByTab = documents.filter(
      (document) => activeTab === "TODOS" || document.type === activeTab
    );

    const filteredByMenu = filteredByTab.filter((document) => {
      if (!filterBy) return true;
      if (filterBy === "favorites") return document.favorite;
      if (filterBy === "center") return document.center.length > 0;
      if (filterBy === "specialty") return document.specialty.length > 0;
      return document.doctor.length > 0;
    });

    const sorted = sortDocuments(filteredByMenu, sortBy);

    return GROUP_ORDER.map((group) => ({
      title: group,
      documents: sorted.filter((document) => document.group === group),
    })).filter((group) => group.documents.length > 0);
  }, [activeTab, documents, filterBy, sortBy]);

  const handleDeleteDocument = async (documentId: string) => {
    const shouldDelete = window.confirm(
      "Estas seguro de que quieres eliminar este documento?"
    );

    if (!shouldDelete) return;

    try {
      if (user?.email) {
        await api.delete(`/documents/${documentId}/`, {
          params: { email: user.email },
        });
      }

      setDocuments((currentDocuments) =>
        currentDocuments.filter((document) => document.id !== documentId)
      );
      toast.success("Documento eliminado correctamente.");
    } catch (error) {
      console.error("Error al eliminar documento:", error);
      toast.error("No se pudo eliminar el documento.");
    }
  };

  const handleUploadDocument = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!user?.email) {
      toast.error("Debes iniciar sesion para subir documentos.");
      return;
    }

    const title = window.prompt("Nombre del documento", file.name);
    if (!title) return;

    if (categories.length === 0) {
      toast.error("No hay categorias disponibles para subir documentos.");
      return;
    }

    const categoryOptions = categories
      .map((category, index) => `${index + 1}. ${category.name}`)
      .join("\n");
    const categoryIndex = Number(
      window.prompt(`Selecciona categoria:\n${categoryOptions}`, "1")
    );
    const selectedCategory = categories[categoryIndex - 1];

    if (!selectedCategory) {
      toast.error("Categoria no valida.");
      return;
    }

    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("file", file);
    formData.append("title", title);
    formData.append("category_id", selectedCategory.id);
    formData.append("doc_type", getDocTypeByCategory(selectedCategory));

    try {
      setIsUploading(true);
      const response = await api.post("/documents/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const createdDocument = mapSupabaseDocument(response.data.document);
      setDocuments((currentDocuments) => [createdDocument, ...currentDocuments]);
      toast.success("Documento subido correctamente.");
    } catch (error) {
      console.error("Error al subir documento:", error);
      toast.error("No se pudo subir el documento.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleShareDocument = async (document: MedicalDocument) => {
    const shareText = document.fileUrl ?? document.title;

    if (navigator.share) {
      await navigator.share({
        title: document.title,
        text: document.summary,
        url: document.fileUrl ?? window.location.href,
      });
      return;
    }

    await navigator.clipboard?.writeText(shareText);
  };

  return (
    <div className="px-5 py-6 lg:px-8">
      {/* Encabezado: presenta la pagina y la accion principal de subir documentos. */}
      <section className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary-dark">
            Mis Documentos
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona y organiza todos tus registros medicos en un solo lugar.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleUploadDocument}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-mid px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={17} />
          {isUploading ? "Subiendo..." : "Subir documentos"}
        </button>
      </section>

      {isLoading && (
        <div className="mb-4 rounded-lg border border-primary-light bg-white px-4 py-3 text-sm text-gray-600">
          Cargando documentos...
        </div>
      )}

      {/* Tabs: cambian rapidamente entre todos los documentos y sus tipos principales. */}
      <section className="mb-5 w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="grid grid-cols-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-r border-gray-100 px-4 py-3 text-xs font-bold transition last:border-r-0 ${
                activeTab === tab
                  ? "m-1 rounded-lg bg-primary-mid text-white shadow-sm"
                  : "text-primary-dark hover:bg-primary-light"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Dropdowns: reproducen los desplegables del mockup para filtrar y ordenar. */}
      <section className="relative z-20 mb-3 flex flex-wrap">
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === "filter" ? null : "filter")}
            className="flex h-10 w-40 items-center justify-between rounded-l-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-primary-dark shadow-sm"
          >
            Filtrar Por
            <ChevronDown size={15} />
          </button>

          {openMenu === "filter" && (
            <div className="absolute left-0 top-10 w-40 overflow-hidden rounded-b-lg border border-t-0 border-gray-100 bg-white shadow-lg">
              {FILTER_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center justify-between border-b border-gray-50 px-3 py-3 text-sm text-gray-700 last:border-b-0"
                >
                  {option.label}
                  <input
                    type="radio"
                    checked={pendingFilterBy === option.value}
                    onChange={() => setPendingFilterBy(option.value)}
                    className="h-4 w-4 accent-primary-mid"
                  />
                </label>
              ))}
              <div className="flex gap-2 px-3 py-3">
                <button
                  onClick={() => {
                    setFilterBy(pendingFilterBy);
                    setOpenMenu(null);
                  }}
                  className="flex-1 rounded-full bg-primary-mid py-2 text-xs font-semibold text-white"
                >
                  Aplicar
                </button>
                <button
                  onClick={() => {
                    setPendingFilterBy(null);
                    setFilterBy(null);
                    setOpenMenu(null);
                  }}
                  className="flex-1 rounded-full border border-primary-mid py-2 text-xs font-semibold text-primary-dark"
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === "sort" ? null : "sort")}
            className="flex h-10 w-44 items-center justify-between rounded-r-lg border border-l-0 border-gray-200 bg-white px-4 text-sm font-semibold text-primary-dark shadow-sm"
          >
            Ordenar Por
            <ChevronDown size={15} />
          </button>

          {openMenu === "sort" && (
            <div className="absolute left-0 top-10 w-44 overflow-hidden rounded-b-lg border border-t-0 border-gray-100 bg-white shadow-lg">
              {SORT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center justify-between border-b border-gray-50 px-3 py-3 text-sm text-gray-700 last:border-b-0"
                >
                  {option.label}
                  <input
                    type="radio"
                    checked={pendingSortBy === option.value}
                    onChange={() => setPendingSortBy(option.value)}
                    className="h-4 w-4 accent-primary-mid"
                  />
                </label>
              ))}
              <div className="flex gap-2 px-3 py-3">
                <button
                  onClick={() => {
                    setSortBy(pendingSortBy);
                    setOpenMenu(null);
                  }}
                  className="flex-1 rounded-full bg-primary-mid py-2 text-xs font-semibold text-white"
                >
                  Aplicar
                </button>
                <button
                  onClick={() => {
                    setPendingSortBy("newest");
                    setSortBy("newest");
                    setOpenMenu(null);
                  }}
                  className="flex-1 rounded-full border border-primary-mid py-2 text-xs font-semibold text-primary-dark"
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contenido principal: lista de documentos y paneles informativos laterales. */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_17rem]">
        {/* Lista agrupada: organiza documentos por familias clinicas para facilitar lectura. */}
        <section className="space-y-4">
          {groupedDocuments.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-white px-5 py-12 text-center shadow-sm">
              <p className="text-sm font-medium text-gray-700">
                No hay documentos para mostrar.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Ajusta los filtros o sube un nuevo documento.
              </p>
            </div>
          ) : (
            groupedDocuments.map((group) => (
              <article
                key={group.title}
                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <h2 className="text-base font-bold text-gray-800">
                    {group.title}
                  </h2>
                  <button className="text-xs font-bold text-primary-dark hover:text-primary-mid">
                    Ver mas &gt;
                  </button>
                </div>

                <div className="divide-y divide-gray-50">
                  {group.documents.map((doc) => (
                    /* Fila de documento: muestra identificacion, fecha y acciones rapidas. */
                    <div
                      key={doc.id}
                      className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 px-5 py-4 md:grid-cols-[auto_minmax(0,1fr)_7rem_auto]"
                    >
                      <img
                        src={doc.icon}
                        alt=""
                        className="h-10 w-10 rounded-lg object-cover"
                      />

                      <div className="min-w-0 self-center">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {doc.title}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {doc.center}
                        </p>
                      </div>

                      <p className="col-start-2 self-center text-xs text-gray-600 md:col-start-auto md:text-right">
                        {doc.date}
                      </p>

                      <div className="col-span-2 flex items-center gap-4 self-center text-gray-700 md:col-span-1">
                        <button className="transition hover:text-primary-mid" aria-label="Favorito">
                          <Star size={19} />
                        </button>
                        <button
                          onClick={() => downloadDocument(doc)}
                          className="transition hover:text-primary-mid"
                          aria-label="Descargar"
                        >
                          <Download size={18} />
                        </button>
                        <button
                          onClick={() => handleShareDocument(doc)}
                          className="transition hover:text-primary-mid"
                          aria-label="Compartir"
                        >
                          <Share2 size={18} />
                        </button>
                        <button
                          onClick={() => setSelectedDocument(doc)}
                          className="transition hover:text-primary-mid"
                          aria-label="Ver"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="transition hover:text-red-500"
                          aria-label="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))
          )}
        </section>

        {/* Panel lateral: entrega ayudas contextuales y mensajes de seguridad. */}
        <aside className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          {/* Consejo del dia: refuerza buenas practicas para mantener el historial al dia, debe ir conectado a una ia que cambie dia a dia el consejo. */}
          <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb size={21} className="text-primary-mid" />
              <h2 className="text-base font-semibold text-primary-dark">
                Consejo de hoy
              </h2>
            </div>
            <div className="rounded-xl bg-primary-mid px-4 py-3 text-sm leading-5 text-white">
              Sube tus examenes apenas los recibas para mantener tu historial
              actualizado.
            </div>
            <div className="mt-4 flex justify-center">
              {/* Imagen del robot. */}
              <img
                src={documentsRobot}
                alt="Robot asistente de Saludaldia"
                className="h-36 w-36 object-contain"
              />
            </div>
          </section>

          {/* Seguridad: comunica confianza y proteccion de datos medicos. */}
          <section
            className="relative min-h-72 overflow-hidden rounded-xl bg-primary-dark p-6 text-white shadow-sm"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(0,77,77,0.05), rgba(0,77,77,0.86)), url(${documentsSecurity})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          >
            <div className="relative flex min-h-60 flex-col justify-end">
              <h2 className="text-base font-semibold">Protege tu informacion</h2>
              <p className="mt-2 text-sm leading-5 text-white/90">
                Tus datos medicos estan encriptados y protegidos bajo los mas
                altos estandares de seguridad.
              </p>
              <button className="mt-5 w-full rounded-full bg-white/25 py-2 text-sm font-semibold transition hover:bg-white/35">
                Ver mas
              </button>
            </div>
          </section>
        </aside>
      </div>

      {/* Modal de visualizacion: permite revisar el detalle del documento seleccionado. */}
      {selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <section className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary-mid">
                  {selectedDocument.type}
                </p>
                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {selectedDocument.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-gray-500">Fecha</dt>
                <dd className="mt-1 text-gray-900">{selectedDocument.date}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-500">Centro medico</dt>
                <dd className="mt-1 text-gray-900">{selectedDocument.center}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-500">Especialidad</dt>
                <dd className="mt-1 text-gray-900">
                  {selectedDocument.specialty}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-500">Medico</dt>
                <dd className="mt-1 text-gray-900">{selectedDocument.doctor}</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-500">Tipo de archivo</dt>
                <dd className="mt-1 text-gray-900">
                  {selectedDocument.mimeType ?? "Sin tipo registrado"}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-500">Ruta del archivo</dt>
                <dd className="mt-1 break-all text-gray-900">
                  {selectedDocument.fileKey}
                </dd>
              </div>
            </dl>

            <div className="mt-5 rounded-lg bg-gray-50 p-4">
              <p className="text-sm leading-6 text-gray-700">
                {selectedDocument.summary}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => downloadDocument(selectedDocument)}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-mid px-4 py-2 text-sm font-semibold text-primary-dark transition hover:bg-primary-light"
              >
                <Download size={16} />
                Descargar
              </button>
              <button
                onClick={() => setSelectedDocument(null)}
                className="rounded-lg bg-primary-mid px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
              >
                Listo
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
