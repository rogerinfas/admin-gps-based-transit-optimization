'use client';
import dynamic from 'next/dynamic';
import PageShell from '@/components/layout/page-shell';
import { useSimulationRoute } from './_hooks/simulation-hooks';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Cargamos el mapa dinámicamente para evitar errores de SSR con Leaflet
const SimulationMap = dynamic(() => import('./_components/map/simulation-map'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] bg-muted rounded-xl animate-pulse">
      <p className="text-muted-foreground font-medium">Inicializando motor de mapas...</p>
    </div>
  ),
});

export default function SimulationPage() {
  const { routeId } = useSimulationRoute();

  return (
    <PageShell navbarVariant="dark">
      <div className="bg-background min-h-screen py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <header className="mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Monitoreo en Tiempo Real
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Seguimiento satelital y trayectorias interpoladas mediante PostGIS.
            </p>
          </header>

          <main>
            {routeId ? (
              <div className="space-y-8">
                <SimulationMap routeId={routeId} />
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Unidad SIT</h3>
                      <p className="text-3xl font-black mt-1">T-1</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Origen</h3>
                      <p className="text-2xl font-bold mt-1">Characato</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Destino</h3>
                      <p className="text-2xl font-bold mt-1">Guardia Civil</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 flex flex-col justify-center">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Estado</h3>
                      <Badge variant="default" className="bg-green-600 w-max text-white hover:bg-green-700 animate-pulse shadow-md">
                        En Tránsito Activo
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 rounded-3xl border-2 border-dashed">
                <p className="text-xl text-muted-foreground">Conectando con el servidor de tránsito...</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageShell>
  );
}
