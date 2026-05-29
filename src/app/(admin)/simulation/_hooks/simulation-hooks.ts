import { useState, useEffect } from 'react';
import { getBackendUrl } from '@/lib/api/types/backend';
import { Route } from '../_types/simulation.types';

export function useSimulationRoute() {
  const [routeId, setRouteId] = useState<string | null>(null);
  const API_URL = getBackendUrl();

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

  return { routeId };
}
