import { useAuthStore } from "@/lib/store/auth.store";
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Hola, {user?.firstName} {user?.lastName} 👋
      </h1>
      <p className="text-sm text-gray-500 mt-1">Tu historial médico digital</p>
      {/* TODO Sprint 2: stats, documentos recientes, alertas IA */}
    </div>
  );
}
