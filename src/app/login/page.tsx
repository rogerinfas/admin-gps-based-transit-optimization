'use client';

import { useState } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { getBackendUrl } from "@/lib/api/types/backend";
import { toast } from "sonner";
import PageShell from "@/components/layout/page-shell";
import { ArrowRight, Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("user@gps-transit.com");
  const [password, setPassword] = useState("User123!");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const API_URL = getBackendUrl();
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Credenciales inválidas o incorrectas");
      }

      const data = await res.json();
      login(data.access_token, data.user);
      toast.success(`Bienvenido de nuevo, ${data.user.name} 👋`);
    } catch (err: any) {
      toast.error(err.message || "Error al iniciar sesión");
      setIsSubmitting(false); // only toggle if error, success redirects
    }
  };

  return (
    <PageShell navbarVariant="light">
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-surface px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-surface-strong p-8 ring-1 ring-foreground/10 shadow-xl transition-all">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Iniciar Sesión</h1>
            <p className="mt-2 text-sm text-muted">Ingresa a TransiGo Panel de Operaciones</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold tracking-wider text-muted uppercase">Correo Electrónico</label>
                <div className="group relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted group-focus-within:text-primary transition-colors">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-foreground/10 bg-surface py-3 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    placeholder="admin@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold tracking-wider text-muted uppercase">Contraseña</label>
                <div className="group relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted group-focus-within:text-primary transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-foreground/10 bg-surface py-3 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-contrast shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
