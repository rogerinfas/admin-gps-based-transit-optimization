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

import { getBackendUrl } from '@/lib/api/types/backend';

export default function SimulationPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [subscribedRouteIds, setSubscribedRouteIds] = useState<string[]>([]);
  const API_URL = getBackendUrl();

  useEffect(() => {
    fetch(`${API_URL}/routes`)
      .then(res => res.json())
      .then((data: Route[]) => {
        setRoutes(data);
        if (data.length > 0) {
          // Suscribirse a la primera ruta por defecto
          setSubscribedRouteIds([data[0].id]);
        }
      })
      .catch(err => console.error('Error al buscar rutas:', err));
  }, [API_URL]);

  const toggleSubscription = (routeId: string) => {
    setSubscribedRouteIds(prev => 
      prev.includes(routeId)
        ? prev.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  return (
    <PageShell navbarVariant="dark">
      <div className="bg-slate-50 min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                Monitoreo en Tiempo Real
              </h1>
              <p className="text-lg text-slate-600 mt-2">
                Seguimiento satelital de vehículos usando WebSockets (Pub/Sub).
              </p>
            </div>

            {routes.length > 0 && (
              <div className="min-w-[300px]">
                <label className="block text-sm font-bold text-slate-700 mb-2">Suscribirse a Rutas</label>
                <div className="flex flex-wrap gap-2">
                  {routes.map(route => {
                    const isSubscribed = subscribedRouteIds.includes(route.id);
                    return (
                      <button
                        key={route.id}
                        onClick={() => toggleSubscription(route.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all cursor-pointer ${
                          isSubscribed 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                            : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                        }`}
                      >
                        {route.code} {isSubscribed && '✓'}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </header>

          <main>
            {subscribedRouteIds.length > 0 ? (
              <div className="space-y-8">
                <SimulationMap routeIds={subscribedRouteIds} />
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Suscripciones</h3>
                    <p className="text-3xl font-black text-slate-800 mt-1">{subscribedRouteIds.length} rutas</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rutas Activas</h3>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {routes.filter(r => subscribedRouteIds.includes(r.id)).map(r => (
                        <span key={r.id} className="text-sm font-medium bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          {r.code} - {r.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado Servidor</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-lg font-semibold text-emerald-600">WebSocket OK</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-xl text-slate-400">Selecciona al menos una ruta para iniciar el monitoreo...</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageShell>
  );
}
