import { useParams } from "react-router-dom";
export default function SharePage() {
  const { token } = useParams<{ token: string }>();
  return (
    <div className="min-h-screen bg-surface-light p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="font-semibold">Saludaldia — Acceso médico</span>
        </div>
        <p className="text-sm text-gray-500">Token: {token}</p>
        {/* TODO Sprint 3: portal médico */}
      </div>
    </div>
  );
}
