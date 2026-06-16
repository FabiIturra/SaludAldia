import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth.store";
import { useThemeStore } from "@/lib/store/theme.store";
import { Sun, Moon } from "lucide-react";

const schema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post("/auth/login/", data);
      setUser(res.data.user, res.data.access);
      toast.success(`Bienvenido, ${res.data.user.firstName}`);
      navigate("/");
    } catch {
      toast.error("Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light dark:bg-surface-dark px-4 transition-colors duration-200 relative">
      <div className="absolute top-4 right-4">
        <button onClick={toggleTheme}
          className="p-2.5 bg-white dark:bg-surface-darkCard border border-gray-100 dark:border-emerald-900/30 rounded-xl shadow-sm text-gray-600 dark:text-emerald-300/80 hover:bg-gray-50 dark:hover:bg-emerald-950/30 transition-all"
          title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
        </button>
      </div>

      <div className="w-full max-w-sm bg-white dark:bg-surface-darkCard rounded-2xl shadow-sm border border-gray-100 dark:border-emerald-900/30 p-8 transition-colors duration-200">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="font-semibold text-gray-900 dark:text-white">Saludaldia</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Ingresar</h1>
        <p className="text-sm text-gray-500 dark:text-emerald-300/60 mb-6">Accede a tu historial médico</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-emerald-100/90 mb-1">Correo electrónico</label>
            <input {...register("email")} type="email" placeholder="tu@correo.cl"
              className="w-full px-3 py-2 border border-gray-200 dark:border-emerald-900/40 bg-white dark:bg-emerald-950/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-emerald-700/50 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-emerald-100/90 mb-1">Contraseña</label>
            <input {...register("password")} type="password" placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-200 dark:border-emerald-900/40 bg-white dark:bg-emerald-950/20 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-emerald-700/50 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting}
            className="w-full py-2.5 bg-brand-700 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-emerald-500/80 mt-6">
          ¿No tienes cuenta?{" "}
          <Link to="/signup" className="text-brand-700 dark:text-brand-400 font-medium hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
