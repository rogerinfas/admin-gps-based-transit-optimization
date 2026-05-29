"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-provider";
import { getBackendUrl } from "@/lib/api/types/backend";
import { toast } from "sonner";

const CONTACT_EMAIL = "soporte@transigo.app";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@gps-transit.com");
  const [password, setPassword] = useState("Admin123!");
  const [remember, setRemember] = useState(true);
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
      if (!res.ok) throw new Error("Credenciales inválidas");
      const data = await res.json();
      login(data.access_token, data.user);
      toast.success(`Bienvenido, ${data.user.name} 👋`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar sesión");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-[60%_40%] p-0 bg-card">
      {/* LEFT PANEL — Background image */}
      <div className="relative hidden h-full w-full flex-col lg:flex overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/login-bg.png"
          alt="Vista aérea de Arequipa con trazados GPS"
          className="h-full w-full object-cover brightness-90"
        />
        {/* Overlay with branding */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-10">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium text-white/90">
              &ldquo;Optimizando el transporte público de Arequipa con tecnología GPS y análisis en tiempo real.&rdquo;
            </p>
            <footer className="text-sm text-white/60">Sistema de Gestión de Tránsito — TransiGo</footer>
          </blockquote>
        </div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div className="grid grid-rows-[auto_1fr_auto] h-full p-4 sm:p-6">
        {/* Logo + Back to home */}
        <div className="relative z-20 flex items-center justify-between w-full pt-4 sm:pt-6 px-4 sm:px-6 pb-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-background fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">TransiGo</span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Volver al inicio
          </Link>
        </div>

        {/* Center Card */}
        <div className="w-full max-w-md flex items-center justify-center mx-auto px-4 sm:px-0">
          <Card className="w-full shadow-sm">
            <CardHeader className="px-4 sm:px-6 pb-2">
              <CardTitle className="text-center font-bold text-2xl sm:text-3xl lg:text-[34px]">
                ¡Hola, bienvenido!
              </CardTitle>
              <CardDescription className="text-center text-sm sm:text-[15px] font-normal">
                Ingresa al panel de operaciones de TransiGo
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 py-2">
                {/* Email field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor="email">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ingresa tu correo"
                      className="pl-9 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" htmlFor="password">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ingresa tu contraseña"
                      className="pl-9 text-sm sm:text-base"
                    />
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-xs sm:text-sm text-foreground hover:text-foreground/70 hover:underline font-medium transition-colors self-end"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(v) => setRemember(!!v)}
                  />
                  <label htmlFor="remember" className="cursor-pointer font-normal text-xs sm:text-sm leading-tight">
                    Recordar detalles del inicio de sesión
                  </label>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full text-sm sm:text-base">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>
              </form>
            </CardContent>

            <Separator />

            <CardFooter className="px-4 sm:px-6 pt-4">
              <div className="flex items-center justify-center space-x-1 w-full text-xs sm:text-sm text-muted-foreground flex-wrap">
                <p>¿Necesitas ayuda?</p>
                <Link
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-foreground hover:underline font-semibold"
                >
                  Contáctanos
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Footer copyright */}
        <div className="text-start text-sm font-normal px-4 sm:px-6 pb-4 sm:pb-5">
          <p className="text-sm sm:text-[15px] text-muted-foreground">
            © {new Date().getFullYear()} TransiGo — Sistema de Optimización de Tránsito GPS. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
