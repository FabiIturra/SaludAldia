import { useAuthStore } from "@/lib/store/auth.store";
import { getDocuments, mapApiDocType } from "@/lib/api/documents.api";
import type { ApiMedicalDocument } from "@/lib/types/api.types";
import { Share2, Upload, Lightbulb, ShieldCheck, Download, Share2 as ShareIcon, Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import robotImg from "@/assets/img/robot.png";
import fondoSeguridadImg from "@/assets/img/fondo-seguridad.png";
import iconoDocumentos from "@/assets/img/icono-documentos.png";
import iconoExamenes from "@/assets/img/icono-examenes.png";
import iconoLicencias from "@/assets/img/icono-licencias.png";
import iconoRecetas from "@/assets/img/icono-recetas.png";

const CATEGORIAS = ["Todos", "Examen", "Receta", "Licencia"];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState("Todos");
  const [apiDocs, setApiDocs] = useState<ApiMedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);
    getDocuments(user.email)
      .then((docs) => setApiDocs(docs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.email]);

  // mapear tipo de la api a tipo visual
  const typeToLabel = (t: string) => {
    const mapped = mapApiDocType(t);
    if (mapped === "EXAMENES") return "Examen";
    if (mapped === "RECETA") return "Receta";
    if (mapped === "LICENCIA") return "Licencia";
    return t;
  };

  const typeToStyle = (t: string) => {
    if (t === "EXAMENES") return { icono: "\ud83e\uddea", color: "bg-categoria-examenesBg text-categoria-examenes" };
    if (t === "RECETA") return { icono: "\ud83d\udc8a", color: "bg-categoria-recetasBg text-categoria-recetas" };
    if (t === "LICENCIA") return { icono: "\ud83d\udccb", color: "bg-categoria-licenciasBg text-categoria-licencias" };
    return { icono: "\ud83d\udcc4", color: "bg-gray-100 text-gray-600" };
  };

  const formatDocDate = (d: string | null) => {
    if (!d) return "Sin fecha";
    return new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "short", year: "numeric" })
      .format(new Date(d + "T00:00:00")).replace(".", "");
  };

  const DOCUMENTOS = apiDocs.map((doc, i) => ({
    id: i + 1,
    nombre: doc.title,
    tipo: typeToLabel(doc.document_type),
    fecha: formatDocDate(doc.document_date),
    ...typeToStyle(doc.document_type),
  }));

  // calcular stats desde documentos reales
  const examCount = apiDocs.filter((d) => ["exam", "report", "vaccine", "other"].includes(d.document_type)).length;
  const recetaCount = apiDocs.filter((d) => d.document_type === "prescription").length;
  const licenciaCount = apiDocs.filter((d) => d.document_type === "sick_leave").length;

  const STATS = [
    { label: "Exámenes", value: examCount, icono: iconoExamenes, color: "text-categoria-examenes", border: "border-b-categoria-examenes" },
    { label: "Recetas", value: recetaCount, icono: iconoRecetas, color: "text-categoria-recetas", border: "border-b-categoria-recetas" },
    { label: "Licencias", value: licenciaCount, icono: iconoLicencias, color: "text-categoria-licencias", border: "border-b-categoria-licencias" },
    { label: "Documentos", value: apiDocs.length, icono: iconoDocumentos, color: "text-categoria-documentos", border: "border-b-categoria-documentos" },
  ];

  return (
    <div className="p-6">
      {loading && (
        <div className="mb-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700">
          Cargando datos...
        </div>
      )}

      {/* Bienvenida + botones */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Bienvenido de nuevo,{" "}
            <span className="text-primary-mid">{user?.name || "Usuario"}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Aquí está el resumen de tu actividad médica reciente.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary-mid text-primary-mid text-sm hover:bg-primary-light transition-colors">
            <Share2 size={15} />
            Compartir historial
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-mid text-white text-sm hover:bg-primary-dark transition-colors">
            <Upload size={15} />
            Subir documento
          </button>
        </div>
      </div>

      {/* Layout dos columnas */}
      <div className="flex gap-6 items-start">

        {/* COLUMNA IZQUIERDA */}
        <div className="flex-1 min-w-0">

          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {STATS.map(({ label, value, icono, border }) => (
            <div key={label} className={`bg-white rounded-xl shadow-md p-4 flex flex-col items-center gap-2 border border-gray-100 border-b-4 ${border}`}>
              <img src={icono} alt={label} className="w-12 h-12 object-contain" />
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          ))}
          </div>

          {/* Tabla de documentos */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4">

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {CATEGORIAS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                    activeTab === tab
                      ? "bg-primary-mid text-white font-medium"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Filas */}
            <div className="divide-y divide-gray-50">
              {DOCUMENTOS.filter((doc) => activeTab === "Todos" || doc.tipo === activeTab).map((doc) => (
                <div key={doc.id} className="flex items-center gap-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
                    {doc.icono}
                  </div>
                  <p className="flex-1 text-sm text-gray-700 font-medium">{doc.nombre}</p>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-medium ${doc.color}`}>
                    {doc.tipo}
                  </span>
                  <p className="text-xs text-gray-400 w-24 text-right">{doc.fecha}</p>
                  <div className="flex gap-3 text-gray-400">
                    <button className="hover:text-primary-mid transition-colors"><Download size={15} /></button>
                    <button className="hover:text-primary-mid transition-colors"><ShareIcon size={15} /></button>
                    <button className="hover:text-primary-mid transition-colors"><Eye size={15} /></button>
                    <button className="hover:text-red-400 transition-colors"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
              {!loading && DOCUMENTOS.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-400">
                  No hay documentos registrados
                </div>
              )}
            </div>

            {/* Ver historial completo */}
            <div className="text-center mt-4">
              <button className="text-sm text-primary-mid hover:underline">
                Ver historial completo
              </button>
            </div>

          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-4 self-start">

          {/* Consejo del día */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-md p-4 min-h-70">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={18} className="text-yellow-400" />
              <p className="text-sm font-medium text-gray-700">Consejo de hoy</p>
            </div>
            <p className="text-sm text-gray-500 text-center leading-relaxed mb-4">
              Sube tus exámenes apenas los recibas para mantener tu historial actualizado.
            </p>
            <div className="flex justify-center">
              <img src={robotImg} alt="Robot IA" className="w-24 h-24 object-contain" />
            </div>
          </div>

          {/* Protege tu información */}
          <div className="rounded-xl overflow-hidden text-white relative min-h-80" style={{ backgroundImage: `url(${fondoSeguridadImg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
           <div className="p-4 flex flex-col justify-between h-full min-h-80">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-white" />
                <p className="text-sm font-medium text-white">Protege tu información</p>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                Tu historial médico está cifrado y protegido. Solo tú decides quién puede verlo.
              </p>
            </div>
            <button className="w-full py-2 rounded-lg bg-primary-mid text-white text-xs hover:bg-primary-accent transition-colors mt-2">
              Ver más
            </button>
          </div>
          </div>
        </div>

      </div>
    </div>
  );
}
