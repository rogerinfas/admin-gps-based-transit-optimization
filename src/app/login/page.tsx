"use client";

import { useState } from "react";
import Link from "next/link";
import PageShell from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
import { getBackendUrl } from "@/lib/api/types/backend";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@gps-transit.com");
  const [password, setPassword] = useState("Admin123!");
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Error al iniciar sesión";
      toast.error(errorMessage);
      setIsSubmitting(false); // only toggle if error, success redirects
    }
  };

  return (
    <PageShell navbarVariant="light" mainClassName="flex-1 flex flex-col items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center space-y-3 text-center mb-10">
          <div className="bg-primary/10 p-4 rounded-full mb-2">
            <Bus className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Bienvenido de nuevo</h1>
          <p className="text-muted-foreground">
            Ingresa tus credenciales para acceder al panel
          </p>
        </div>

        <Card className="border-border shadow-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold">Iniciar Sesión</CardTitle>
            <CardDescription>
              Introduce tu correo electrónico y contraseña abajo
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6">
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <label className="text-sm font-semibold leading-none" htmlFor="email">
                  Correo Electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operador@transigo.app"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold leading-none" htmlFor="password">
                    Contraseña
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-primary hover:underline underline-offset-4"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  placeholder="••••••••" 
                />
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <Checkbox id="remember" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none"
                >
                  Mantener sesión iniciada
                </label>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full mt-2 font-bold py-5">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  "Ingresar al Sistema"
                )}
              </Button>
            </form>

            <div className="relative mt-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-semibold">
                  O accede con
                </span>
              </div>
            </div>

            <Button variant="outline" type="button" className="w-full font-semibold py-5">
              <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
              </svg>
              Google Workspace
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col text-center mt-2">
            <p className="text-sm text-muted-foreground">
              Al ingresar, aceptas los{" "}
              <Link href="/terms" className="underline hover:text-primary">
                Términos de Servicio
              </Link>{" "}
              y la{" "}
              <Link href="/privacy" className="underline hover:text-primary">
                Política de Privacidad
              </Link>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </PageShell>
  );
}
