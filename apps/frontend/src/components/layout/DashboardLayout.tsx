import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/lib/store/auth.store";
import { useThemeStore } from "@/lib/store/theme.store";
import { Sun, Moon } from "lucide-react";

const NAV = [
  { path: "/",            label: "Inicio",        icon: "🏠" },
  { path: "/documents",   label: "Documentos",    icon: "📁" },
  { path: "/ai-insights", label: "Análisis IA",   icon: "✨" },
  { path: "/profile",     label: "Perfil médico", icon: "👤" },
];

export default function DashboardLayout() {
  const user    = useAuthStore((s) => s.user);
  const logout  = useAuthStore((s) => s.logout);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-200">
      <aside className="w-56 bg-white dark:bg-surface-darkCard border-r border-gray-100 dark:border-emerald-900/30 flex flex-col transition-colors duration-200">
        <div className="p-5 border-b border-gray-100 dark:border-emerald-900/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-700 flex items-center justify-center text-white font-bold text-xs">S</div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">Saludaldia</span>
          </div>
        </div>
        {/* Nombre del paciente post-login — requerimiento del cliente */}
        <div className="p-4 border-b border-gray-100 dark:border-emerald-900/30">
          <p className="text-xs text-gray-400 dark:text-emerald-500/80">Paciente</p>
          <p className="text-sm font-medium text-gray-900 dark:text-emerald-50 truncate">{user?.firstName} {user?.lastName}</p>
          {user?.rut && <p className="text-xs text-gray-400 dark:text-emerald-500/60">RUT {user.rut}</p>}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ path, label, icon }) => (
            <NavLink key={path} to={path} end={path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive 
                    ? "bg-brand-100 dark:bg-brand-900/40 text-brand-900 dark:text-brand-300 font-medium" 
                    : "text-gray-600 dark:text-emerald-300/80 hover:bg-gray-50 dark:hover:bg-emerald-950/30"
                }`
              }
            >
              <span>{icon}</span>{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100 dark:border-emerald-900/30 space-y-1">
          <button onClick={toggleTheme}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 dark:text-emerald-300/80 hover:bg-gray-50 dark:hover:bg-emerald-950/30 rounded-lg text-left transition-all">
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
            <span>{isDarkMode ? "Modo claro" : "Modo oscuro"}</span>
          </button>
          <button onClick={() => { logout(); navigate("/login"); }}
            className="w-full px-3 py-2 text-sm text-gray-500 dark:text-emerald-400/60 hover:bg-gray-50 dark:hover:bg-emerald-950/30 rounded-lg text-left transition-colors">
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  );
}
