'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowLeft } from "lucide-react";
import PageShell from "@/components/layout/page-shell";

export default function NotFound() {
  return (
    <PageShell navbarVariant="dark" mainClassName="flex-1 flex items-center justify-center py-12 px-6">
      
      {/* Premium Glassmorphic Card */}
      <div className="relative max-w-md w-full bg-card border border-border p-8 md:p-10 rounded-3xl shadow-xl flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Animated Icon Map Pin Off effect */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
          <MapPin size={40} className="animate-bounce" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-destructive animate-ping"></span>
          <span className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-destructive"></span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            404
          </h1>
          <h2 className="text-xl font-bold text-foreground">
            Página no encontrada
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            La página que buscas no existe, ha sido movida o está temporalmente fuera de servicio. Comprueba la dirección o regresa al inicio de TransiGo.
          </p>
        </div>

        <Button 
          variant="default"
          render={<Link href="/" />}
          nativeButton={false}
          className="w-full font-semibold gap-2 shadow-sm"
        >
          <ArrowLeft size={16} /> Volver al Inicio
        </Button>
      </div>
      
    </PageShell>
  );
}
