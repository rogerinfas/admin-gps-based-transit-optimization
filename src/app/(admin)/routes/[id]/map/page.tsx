'use client';
import dynamic from 'next/dynamic';
import PageShell from '@/components/layout/page-shell';
import { use } from 'react';

// Cargamos el mapa dinámicamente para evitar errores de SSR con Leaflet
const RouteEditorMap = dynamic(() => import('./_components/map/route-editor-map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-muted rounded-xl animate-pulse">
      <p className="text-muted-foreground font-medium">Cargando motor de mapas...</p>
    </div>
  ),
});

export default function RouteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  // En Next.js >15 los params se desenvuelven con use()
  const resolvedParams = use(params);
  
  return (
    <PageShell navbarVariant="dark">
      <div className="bg-background min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
              Editor Interactivo de Trayectos
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Haz clic en el mapa para registrar los puntos del trayecto (Polyline) de esta ruta.
            </p>
          </header>

          <main>
            <RouteEditorMap routeId={resolvedParams.id} />
          </main>
        </div>
      </div>
    </PageShell>
  );
}
