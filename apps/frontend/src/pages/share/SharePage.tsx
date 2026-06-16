import { useParams } from "react-router-dom";
import { useThemeStore } from "@/lib/store/theme.store";
import { Sun, Moon } from "lucide-react";

export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  const { isDarkMode, toggleTheme } = useThemeStore();

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark p-6 transition-colors duration-200 relative">
      <div className="absolute top-4 right-4">
        <button onClick={toggleTheme}
          className="p-2.5 bg-white dark:bg-surface-darkCard border border-gray-100 dark:border-emerald-900/30 rounded-xl shadow-sm text-gray-600 dark:text-emerald-300/80 hover:bg-gray-50 dark:hover:bg-emerald-950/30 transition-all"
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="font-semibold text-gray-900 dark:text-white">Saludaldia — Acceso médico</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-emerald-400/80">Token: {token}</p>
        {/* TODO Sprint 3: portal médico */}
      </div>
    </div>
  );
}
