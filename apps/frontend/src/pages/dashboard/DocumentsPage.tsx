import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Download,
  Eye,
  Lightbulb,
  Plus,
  Share2,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/auth.store";
import { getDocuments, deleteDocument, mapApiDocType, createDocument, getCategories } from "@/lib/api/documents.api";
import type { ApiMedicalDocument, DocumentCategory } from "@/lib/types/api.types";
import documentsRobot from "@/assets/img/robot.png";
import documentsSecurity from "@/assets/img/fondo-seguridad.png";
import iconExam from "@/assets/img/icono-examenes.png";
import iconPrescription from "@/assets/img/icono-recetas.png";
import iconLicense from "@/assets/img/icono-licencias.png";

type DocumentGroup = "Examenes" | "Recetas Medicas" | "Certificados";
type DocumentType = "EXAMENES" | "RECETA" | "LICENCIA";
type TabOption = "TODOS" | "EXAMENES" | "RECETA" | "LICENCIA";
type FilterOption = "favorites" | "center" | "specialty" | "doctor" | null;
type SortOption = "newest" | "oldest" | "name";

type SupabaseDocumentRecord = {
  id: string;
  title: string;
  doc_type: DocumentType;
  document_date: string | null;
  issuing_institution: string | null;
  issuing_professional: string | null;
  favorite: boolean;
  specialty: string | null;
  file_key: string;
  file_url: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  summary: string | null;
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
  fileKey: string;
  fileUrl: string | null;
  mimeType: string | null;
  fileSizeBytes: number | null;
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



function getDocumentGroup(type: DocumentType): DocumentGroup {
  if (type === "RECETA") return "Recetas Medicas";
  if (type === "LICENCIA") return "Certificados";
  return "Examenes";
}

function getDocumentIcon(type: DocumentType) {
  if (type === "RECETA") return iconPrescription;
  if (type === "LICENCIA") return iconLicense;
  return iconExam;
}

// mapper: convierte respuesta de api al formato interno
function mapApiToRecord(doc: ApiMedicalDocument): SupabaseDocumentRecord {
  return {
    id: doc.id,
    title: doc.title,
    doc_type: mapApiDocType(doc.document_type),
    document_date: doc.document_date,
    issuing_institution: doc.medical_center,
    issuing_professional: doc.doctor_name,
    favorite: doc.favorite ?? false,
    specialty: doc.specialty,
    file_key: doc.file_key ?? "",
    file_url: doc.file_url,
    mime_type: doc.mime_type ?? null,
    file_size_bytes: doc.file_size_bytes ?? null,
    summary: doc.summary ?? null,
  };
}

function mapSupabaseDocument(record: SupabaseDocumentRecord): MedicalDocument {
  // adaptador entre record y el modelo que necesita la interfaz
  return {
    id: record.id,
    group: getDocumentGroup(record.doc_type),
    title: record.title,
    type: record.doc_type,
    date: formatDate(record.document_date),
    isoDate: record.document_date ?? new Date().toISOString().slice(0, 10),
    icon: getDocumentIcon(record.doc_type),
    center: record.issuing_institution ?? "Sin centro medico",
    specialty: record.specialty ?? "Sin especialidad",
    doctor: record.issuing_professional ?? "Sin medico",
    favorite: record.favorite,
    summary: record.summary ?? "Documento medico guardado en Saludaldia.",
    fileKey: record.file_key,
    fileUrl: record.file_url,
    mimeType: record.mime_type,
    fileSizeBytes: record.file_size_bytes,
  };
}

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
  const user = useAuthStore((s) => s.user);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabOption>("TODOS");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [pendingSortBy, setPendingSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>(null);
  const [pendingFilterBy, setPendingFilterBy] = useState<FilterOption>(null);
  const [openMenu, setOpenMenu] = useState<"filter" | "sort" | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<MedicalDocument | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadCategories, setUploadCategories] = useState<DocumentCategory[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    title: "",
    document_type: "",
    category_id: "",
    document_date: "",
    medical_center: "",
    specialty: "",
    doctor_name: "",
    favorite: false,
  });

  // funcion reutilizable para cargar documentos
  const loadDocuments = () => {
    if (!user?.email) return;
    setLoading(true);
    setError(null);
    getDocuments(user.email)
      .then((apiDocs) => {
        const mapped = apiDocs.map(mapApiToRecord).map(mapSupabaseDocument);
        setDocuments(mapped);
      })
      .catch(() => setError("Error al cargar documentos"))
      .finally(() => setLoading(false));
  };

  // cargar documentos reales del backend
  useEffect(() => {
    loadDocuments();
  }, [user?.email]);

  // cargar categorias cuando se abre el modal de subida
  useEffect(() => {
    if (!showUploadModal) return;
    getCategories()
      .then((cats) => setUploadCategories(cats))
      .catch(() => toast.error("Error al cargar categorias"));
  }, [showUploadModal]);

  const handleUploadSubmit = async () => {
    if (!user?.email) return;
    if (!uploadForm.file || !uploadForm.title || !uploadForm.document_type || !uploadForm.category_id) {
      toast.error("Completa los campos obligatorios: archivo, titulo, tipo y categoria");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadForm.file);
      formData.append("title", uploadForm.title);
      formData.append("document_type", uploadForm.document_type);
      formData.append("category_id", uploadForm.category_id);
      if (uploadForm.document_date) formData.append("document_date", uploadForm.document_date);
      if (uploadForm.medical_center) formData.append("medical_center", uploadForm.medical_center);
      if (uploadForm.specialty) formData.append("specialty", uploadForm.specialty);
      if (uploadForm.doctor_name) formData.append("doctor_name", uploadForm.doctor_name);
      if (uploadForm.favorite) formData.append("favorite", "true");

      await createDocument(user.email, formData);
      toast.success("Documento subido exitosamente");
      setUploadForm({
        file: null,
        title: "",
        document_type: "",
        category_id: "",
        document_date: "",
        medical_center: "",
        specialty: "",
        doctor_name: "",
        favorite: false,
      });
      setShowUploadModal(false);
      loadDocuments();
    } catch {
      toast.error("Error al subir el documento");
    } finally {
      setUploading(false);
    }
  };

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

    if (!shouldDelete || !user?.email) return;

    try {
      await deleteDocument(documentId, user.email);
      setDocuments((currentDocuments) =>
        currentDocuments.filter((document) => document.id !== documentId)
      );
      toast.success("Documento eliminado");
    } catch {
      toast.error("Error al eliminar documento");
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
      {/* estado de carga y error */}
      {loading && (
        <div className="mb-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          Cargando documentos...
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

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

        <button onClick={() => setShowUploadModal(true)} className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-mid px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary-dark">
          <Plus size={17} />
          Subir documentos
        </button>
      </section>

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

      {/* Modal de subida de documentos */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <section className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Subir documento</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Archivo */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Archivo <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files?.[0] ?? null })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 file:mr-3 file:rounded-full file:border-0 file:bg-primary-mid file:px-4 file:py-1 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark focus:border-[var(--brand-mid)] focus:outline-none"
                />
              </div>

              {/* Titulo */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Titulo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Ej: Hemograma completo"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[var(--brand-mid)] focus:outline-none"
                />
              </div>

              {/* Tipo de documento */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Tipo de documento <span className="text-red-500">*</span>
                </label>
                <select
                  value={uploadForm.document_type}
                  onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[var(--brand-mid)] focus:outline-none"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="exam">Examen</option>
                  <option value="prescription">Receta</option>
                  <option value="sick_leave">Licencia medica</option>
                  <option value="report">Informe medico</option>
                  <option value="vaccine">Vacuna</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">
                  Categoria <span className="text-red-500">*</span>
                </label>
                <select
                  value={uploadForm.category_id}
                  onChange={(e) => setUploadForm({ ...uploadForm, category_id: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[var(--brand-mid)] focus:outline-none"
                >
                  <option value="">Seleccionar categoria</option>
                  {uploadCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Fecha del documento</label>
                <input
                  type="date"
                  value={uploadForm.document_date}
                  onChange={(e) => setUploadForm({ ...uploadForm, document_date: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[var(--brand-mid)] focus:outline-none"
                />
              </div>

              {/* Centro medico */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Centro medico</label>
                <input
                  type="text"
                  value={uploadForm.medical_center}
                  onChange={(e) => setUploadForm({ ...uploadForm, medical_center: e.target.value })}
                  placeholder="Ej: Hospital Clinico UC"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[var(--brand-mid)] focus:outline-none"
                />
              </div>

              {/* Especialidad */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Especialidad</label>
                <input
                  type="text"
                  value={uploadForm.specialty}
                  onChange={(e) => setUploadForm({ ...uploadForm, specialty: e.target.value })}
                  placeholder="Ej: Cardiologia"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[var(--brand-mid)] focus:outline-none"
                />
              </div>

              {/* Medico */}
              <div>
                <label className="mb-1 block text-sm font-semibold text-gray-700">Medico</label>
                <input
                  type="text"
                  value={uploadForm.doctor_name}
                  onChange={(e) => setUploadForm({ ...uploadForm, doctor_name: e.target.value })}
                  placeholder="Ej: Dr. Juan Perez"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-[var(--brand-mid)] focus:outline-none"
                />
              </div>

              {/* Favorito */}
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={uploadForm.favorite}
                  onChange={(e) => setUploadForm({ ...uploadForm, favorite: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary-mid"
                />
                Marcar como favorito
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-mid px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
              >
                <Upload size={16} />
                {uploading ? "Subiendo..." : "Subir documento"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
