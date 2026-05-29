'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getBackendUrl } from '@/lib/api/types/backend';

// Cargamos el mapa dinámicamente para evitar errores de SSR con Leaflet
const SimulationMap = dynamic(() => import('./_components/map/simulation-map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-muted rounded-xl animate-pulse">
      <p className="text-muted-foreground font-medium">Inicializando motor de mapas...</p>
    </div>
  ),
});

interface Route {
  id: string;
  code: string;
  name: string;
}

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
      <div className="bg-background min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                Monitoreo en Tiempo Real
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Seguimiento satelital de vehículos usando WebSockets (Pub/Sub).
              </p>
            </div>

            {routes.length > 0 && (
              <div className="min-w-[300px]">
                <label className="block text-sm font-bold mb-2">Suscribirse a Rutas</label>
                <div className="flex flex-wrap gap-2">
                  {routes.map(route => {
                    const isSubscribed = subscribedRouteIds.includes(route.id);
                    return (
                      <Button
                        key={route.id}
                        variant={isSubscribed ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSubscription(route.id)}
                        className="rounded-full"
                      >
                        {route.code} {isSubscribed && '✓'}
                      </Button>
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
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Suscripciones</h3>
                      <p className="text-3xl font-black mt-1">{subscribedRouteIds.length} rutas</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="md:col-span-2">
                    <CardContent className="p-6">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Rutas Activas</h3>
                      <div className="flex flex-wrap gap-1">
                        {routes.filter(r => subscribedRouteIds.includes(r.id)).map(r => (
                          <Badge key={r.id} variant="secondary">
                            {r.code} - {r.name}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 flex flex-col justify-center">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Estado Servidor</h3>
                      <div className="flex items-center gap-2">
                        <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-lg font-semibold text-emerald-600">WebSocket OK</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 rounded-3xl border-2 border-dashed border-border">
                <p className="text-xl text-muted-foreground">Selecciona al menos una ruta para iniciar el monitoreo...</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageShell>
  );
}
