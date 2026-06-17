import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { useAuthStore } from "@/lib/store/auth.store";

const schema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Paso 1: verificar credenciales
      await api.post("/auth/login/", data);
      // Paso 2: obtener datos del usuario desde /auth/me/
      // El login no devuelve el objeto user por seguridad,
      // por eso hacemos una segunda llamada con el email      
      const meRes = await api.get(`/auth/me/?email=${data.email}`);
      setUser(meRes.data.user);
      toast.success(`Bienvenido, ${meRes.data.user.name}`);
      navigate("/");
    } catch {
      toast.error("Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="font-semibold text-gray-900">Saludaldia</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-1">Ingresar</h1>
        <p className="text-sm text-gray-500 mb-6">Accede a tu historial médico</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input {...register("email")} type="email" placeholder="tu@correo.cl"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input {...register("password")} type="password" placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting}
            className="w-full py-2.5 bg-brand-700 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{" "}
          <Link to="/signup" className="text-brand-700 font-medium hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
