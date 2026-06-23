import { useMemo, useState } from "react";
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

const INITIAL_DOCUMENTS: MedicalDocument[] = [
  // Datos mock iniciales; luego pueden reemplazarse por la respuesta del backend.
  {
    id: "perfil-lipidico",
    group: "Examenes",
    title: "Perfil Lipidico",
    type: "EXAMENES",
    date: "08 Oct 2024",
    isoDate: "2024-10-08",
    icon: iconExam,
    center: "Red Salud",
    specialty: "Laboratorio clinico",
    doctor: "Dr. Andres Medina",
    favorite: true,
    summary: "Examen de colesterol total, HDL, LDL y trigliceridos.",
  },
  {
    id: "hemograma-completo",
    group: "Examenes",
    title: "Hemograma Completo",
    type: "EXAMENES",
    date: "07 Oct 2024",
    isoDate: "2024-10-07",
    icon: iconExam,
    center: "Red Salud",
    specialty: "Laboratorio clinico",
    doctor: "Dra. Camila Flores",
    favorite: false,
    summary: "Analisis de globulos rojos, blancos, plaquetas y hematocrito.",
  },
  {
    id: "resonancia-magnetica",
    group: "Examenes",
    title: "Resonancia Magnetica",
    type: "EXAMENES",
    date: "12 Sep 2024",
    isoDate: "2024-09-12",
    icon: iconExam,
    center: "Integramedica",
    specialty: "Imagenologia",
    doctor: "Dr. Nicolas Fuentes",
    favorite: false,
    summary: "Estudio de imagen para control y seguimiento medico.",
  },
  {
    id: "gripe-estacional-receta",
    group: "Recetas Medicas",
    title: "Gripe Estacional - Receta",
    type: "RECETA",
    date: "03 Jun 2024",
    isoDate: "2024-06-03",
    icon: iconPrescription,
    center: "Red Salud",
    specialty: "Medicina general",
    doctor: "Dra. Valentina Rojas",
    favorite: false,
    summary: "Indicaciones de tratamiento para sintomas gripales.",
  },
  {
    id: "control-hipertension",
    group: "Recetas Medicas",
    title: "Control Hipertension",
    type: "RECETA",
    date: "25 Jun 2024",
    isoDate: "2024-06-25",
    icon: iconPrescription,
    center: "Integramedica",
    specialty: "Cardiologia",
    doctor: "Dra. Paula Herrera",
    favorite: true,
    summary: "Receta e indicaciones para control mensual de hipertension.",
  },
  {
    id: "licencia-3-dias",
    group: "Certificados",
    title: "Licencia Medica - 3 dias",
    type: "LICENCIA",
    date: "23 May 2024",
    isoDate: "2024-05-23",
    icon: iconLicense,
    center: "Dr. Hector Valenzuela",
    specialty: "Medicina general",
    doctor: "Dr. Hector Valenzuela",
    favorite: false,
    summary: "Reposo indicado por 3 dias por cuadro respiratorio agudo.",
  },
];

const GROUP_ORDER: DocumentGroup[] = [
  "Examenes",
  "Recetas Medicas",
  "Certificados",
];

function sortDocuments(documents: MedicalDocument[], sortBy: SortOption) {
  return [...documents].sort((a, b) => {
    if (sortBy === "newest") return b.isoDate.localeCompare(a.isoDate);
    if (sortBy === "oldest") return a.isoDate.localeCompare(b.isoDate);
    return a.title.localeCompare(b.title);
  });
}

function downloadDocument(document: MedicalDocument) {
  const content = [
    "Saludaldia - Documento medico",
    `Titulo: ${document.title}`,
    `Tipo: ${document.type}`,
    `Fecha: ${document.date}`,
    `Centro medico: ${document.center}`,
    `Especialidad: ${document.specialty}`,
    `Medico: ${document.doctor}`,
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
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [activeTab, setActiveTab] = useState<TabOption>("TODOS");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [pendingSortBy, setPendingSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>(null);
  const [pendingFilterBy, setPendingFilterBy] = useState<FilterOption>(null);
  const [openMenu, setOpenMenu] = useState<"filter" | "sort" | null>(null);
  const [selectedDocument, setSelectedDocument] =
    useState<MedicalDocument | null>(null);

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

  const handleDeleteDocument = (documentId: string) => {
    const shouldDelete = window.confirm(
      "Estas seguro de que quieres eliminar este documento?"
    );

    if (!shouldDelete) return;

    setDocuments((currentDocuments) =>
      currentDocuments.filter((document) => document.id !== documentId)
    );
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

        <button className="inline-flex w-fit items-center gap-2 rounded-full bg-primary-mid px-7 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary-dark">
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
                          onClick={() => navigator.clipboard?.writeText(doc.title)}
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
          {/* Consejo del dia: refuerza buenas practicas para mantener el historial al dia. */}
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
              {/* Imagen del robot: asset aprobado por diseno para esta tarjeta. */}
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
