import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api/client";

const schema = z.object({
  name: z.string().min(1, "Ingresa tu nombre completo"),
  email: z.string().email("Correo inválido"),
  rut: z.string().min(1, "Ingresa tu RUT"),
  password: z.string()
    .min(6, "Mínimo 6 caracteres")
    .max(12, "Máximo 12 caracteres")
    .regex(/[A-Z]/, "Debe tener al menos una mayúscula")
    .regex(/[a-z]/, "Debe tener al menos una minúscula")
    .regex(/[0-9]/, "Debe tener al menos un número")
    .regex(/[^A-Za-z0-9]/, "Debe tener al menos un símbolo"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { confirmPassword, ...payload } = data;
      await api.post("/auth/register/", payload);
      toast.success("Cuenta creada correctamente.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Error al crear la cuenta");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-light px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="font-semibold text-gray-900">Saludaldia</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Crear cuenta</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input {...register("name")} type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input {...register("email")} type="email"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
            <input {...register("rut")} type="text" placeholder="Ej: 12345678-9 (sin puntos)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            {errors.rut && <p className="text-xs text-red-500 mt-1">{errors.rut.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input {...register("password")} type="password"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input {...register("confirmPassword")} type="password"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting}
            className="w-full py-2.5 bg-brand-700 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 mt-2">
            {isSubmitting ? "Creando..." : "Crear cuenta"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-brand-700 font-medium hover:underline">Ingresar</Link>
        </p>
      </div>
    </div>
  );
}