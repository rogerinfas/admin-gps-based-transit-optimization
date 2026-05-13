'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import PageShell from '@/components/layout/page-shell';

// Cargamos el mapa dinámicamente para evitar errores de SSR con Leaflet
const SimulationMap = dynamic(() => import('@/components/Map/SimulationMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-slate-100 rounded-xl animate-pulse">
      <p className="text-slate-500 font-medium">Inicializando motor de mapas...</p>
    </div>
  ),
});

interface Route {
  id: string;
  code: string;
  name: string;
}

export default function SimulationPage() {
  const [routeId, setRouteId] = useState<string | null>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  useEffect(() => {
    // Buscamos la ruta T1 de Arequipa
    fetch(`${API_URL}/routes`)
      .then(res => res.json())
      .then((routes: Route[]) => {
        const t1 = routes.find((r: Route) => r.code === 'SIT-T1');
        if (t1) setRouteId(t1.id);
      })
      .catch(err => console.error('Error al buscar rutas:', err));
  }, [API_URL]);

  return (
    <PageShell navbarVariant="dark">
      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Monitoreo en Tiempo Real
            </h1>
            <p className="text-lg text-slate-600 mt-2">
              Seguimiento satelital y trayectorias interpoladas mediante PostGIS.
            </p>
          </header>

          <main>
            {routeId ? (
              <div className="space-y-8">
                <SimulationMap routeId={routeId} />
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unidad SIT</h3>
                    <p className="text-3xl font-black text-slate-800 mt-1">T-1</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Origen</h3>
                    <p className="text-2xl font-bold text-slate-800 mt-1">Characato</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Destino</h3>
                    <p className="text-2xl font-bold text-slate-800 mt-1">El Palomar</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm transition hover:shadow-md">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-lg font-semibold text-emerald-600">Activo</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-xl text-slate-400">Conectando con el servidor de tránsito...</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageShell>
  );
}
