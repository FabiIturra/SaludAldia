import { useAuthStore } from "@/lib/store/auth.store";
import { Share2, Upload, FileText, FlaskConical, ClipboardList, FileCheck, Lightbulb, ShieldCheck } from "lucide-react";

const STATS = [
  { label: "Exámenes",   value: 0, icon: FlaskConical,  color: "text-yellow-500", border: "border-b-yellow-400" },
  { label: "Recetas",    value: 0, icon: ClipboardList, color: "text-blue-500",   border: "border-b-blue-400"   },
  { label: "Licencias",  value: 0, icon: FileCheck,     color: "text-orange-500", border: "border-b-orange-400" },
  { label: "Documentos", value: 0, icon: FileText,      color: "text-purple-500", border: "border-b-purple-400" },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
  <div className="p-6">

    {/* Bienvenida + botones — fuera de las columnas */}
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
    <div className="flex gap-6">

      {/* COLUMNA IZQUIERDA */}
      <div className="flex-1 min-w-0">
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {STATS.map(({ label, value, icon: Icon, color, border }) => (
            <div
              key={label}
              className={`bg-white rounded-xl p-4 flex flex-col items-center gap-2 border border-gray-100 border-b-4 ${border}`}
            >
              <Icon size={36} className={color} />
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabla de documentos */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm text-gray-400 text-center py-8">
            Tabla de documentos — próximamente
          </p>
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