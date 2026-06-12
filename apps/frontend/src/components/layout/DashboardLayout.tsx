import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store/auth.store";

const NAV = [
  { path: "/",            label: "Inicio",        icon: "🏠" },
  { path: "/documents",   label: "Documentos",    icon: "📁" },
  { path: "/ai-insights", label: "Análisis IA",   icon: "✨" },
  { path: "/profile",     label: "Perfil médico", icon: "👤" },
];

export default function DashboardLayout() {
  const user    = useAuthStore((s) => s.user);
  const logout  = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-surface-light">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-700 flex items-center justify-center text-white font-bold text-xs">S</div>
            <span className="font-semibold text-gray-900 text-sm">Saludaldia</span>
          </div>
        </div>
        {/* Nombre del paciente post-login — requerimiento del cliente */}
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs text-gray-400">Paciente</p>
          <p className="text-sm font-medium text-gray-900 truncate">{user?.firstName} {user?.lastName}</p>
          {user?.rut && <p className="text-xs text-gray-400">RUT {user.rut}</p>}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ path, label, icon }) => (
            <NavLink key={path} to={path} end={path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-brand-100 text-brand-900 font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
              <span>{icon}</span>{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={() => { logout(); navigate("/login"); }}
            className="w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg text-left">
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  );
}
