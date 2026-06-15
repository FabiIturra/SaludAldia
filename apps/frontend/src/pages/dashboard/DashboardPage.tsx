import { useAuthStore } from "@/lib/store/auth.store";
import { Share2, Upload, FileText, FlaskConical, ClipboardList, FileCheck, Lightbulb, ShieldCheck, Download, Share2 as ShareIcon, Eye, Trash2 } from "lucide-react";
import { useState } from "react";

const STATS = [
  { label: "Exámenes",   value: 3, icon: FlaskConical,  color: "text-categoria-examenes",  border: "border-b-categoria-examenes"  },
  { label: "Recetas",    value: 3, icon: ClipboardList, color: "text-categoria-recetas",   border: "border-b-categoria-recetas"   },
  { label: "Licencias",  value: 1, icon: FileCheck,     color: "text-categoria-licencias", border: "border-b-categoria-licencias" },
  { label: "Documentos", value: 7, icon: FileText,      color: "text-categoria-documentos",border: "border-b-categoria-documentos"},
];

const CATEGORIAS = ["Todos", "Examen", "Receta", "Licencia"];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState("Todos");

  const DOCUMENTOS = [
    { id: 1, nombre: "Hemograma completo", tipo: "Exámen",   fecha: "12 Oct 2024", icono: "🧪", color: "bg-categoria-examenesBg text-categoria-examenes" },
    { id: 2, nombre: "Gripe",              tipo: "Receta",   fecha: "12 Oct 2024", icono: "💊", color: "bg-categoria-recetasBg text-categoria-recetas" },
    { id: 3, nombre: "3 días",             tipo: "Licencia", fecha: "12 Oct 2024", icono: "📋", color: "bg-categoria-licenciasBg text-categoria-licencias" },
    { id: 4, nombre: "Hemograma completo", tipo: "Exámen",   fecha: "05 Oct 2024", icono: "🧪", color: "bg-categoria-examenesBg text-categoria-examenes" },
    { id: 5, nombre: "Gripe",              tipo: "Receta",   fecha: "01 Oct 2024", icono: "💊", color: "bg-categoria-recetasBg text-categoria-recetas" },
    { id: 6, nombre: "Hemograma completo", tipo: "Exámen",   fecha: "28 Sep 2024", icono: "🧪", color: "bg-categoria-examenesBg text-categoria-examenes" },
    { id: 7, nombre: "Gripe",              tipo: "Receta",   fecha: "20 Sep 2024", icono: "💊", color: "bg-purple-100 text-purple-600" },
  ];

  return (
    <div className="p-6">

      {/* Bienvenida + botones */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Bienvenido de nuevo,{" "}
            <span className="text-primary-mid">{user?.firstName || "Usuario"}</span>
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
            {STATS.map(({ label, value, icon: Icon, color, border }) => (
              <div key={label} className={`bg-white rounded-xl p-4 flex flex-col items-center gap-2 border border-gray-100 border-b-4 ${border}`}>
                <Icon size={36} className={color} />
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
                <p className="text-sm text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Tabla de documentos */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">

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
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={18} className="text-yellow-400" />
              <p className="text-sm font-medium text-gray-700">Consejo de hoy</p>
            </div>
            <p className="text-sm text-gray-500 text-center leading-relaxed mb-4">
              Sube tus exámenes apenas los recibas para mantener tu historial actualizado.
            </p>
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center">
                <span className="text-3xl">🤖</span>
              </div>
            </div>
          </div>

          {/* Protege tu información */}
          <div className="bg-primary-dark rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-primary-text" />
              <p className="text-sm font-medium">Protege tu información</p>
            </div>
            <p className="text-xs text-primary-subtle leading-relaxed mb-4">
              Tu historial médico está cifrado y protegido. Solo tú decides quién puede verlo.
            </p>
            <button className="w-full py-2 rounded-lg bg-primary-mid text-white text-xs hover:bg-primary-accent transition-colors">
              Ver más
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}