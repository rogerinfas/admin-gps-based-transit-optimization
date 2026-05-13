'use client';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Fix para los iconos de marcadores en Next.js/Leaflet
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface SimulationMapProps {
  routeId: string;
}

export default function SimulationMap({ routeId }: SimulationMapProps) {
  const [route, setRoute] = useState<{ name: string; path?: [number, number][] } | null>(null);
  const [busPos, setBusPos] = useState<[number, number] | null>(null);
  const [progress, setProgress] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  // 1. Cargar datos de la ruta al inicio
  useEffect(() => {
    if (!routeId) return;
    fetch(`${API_URL}/routes/${routeId}`)
      .then(res => res.json())
      .then(data => setRoute(data))
      .catch(err => console.error('Error cargando ruta:', err));
  }, [routeId, API_URL]);

  // 2. Bucle de simulación (incrementar progreso)
  useEffect(() => {
    if (!routeId) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 0.005; // Incremento suave
        return next > 1 ? 0 : next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [routeId]);

  // 3. Consultar punto interpolado al Backend cada vez que cambia el progreso
  useEffect(() => {
    if (!routeId || progress === null) return;
    
    fetch(`${API_URL}/routes/${routeId}/simulate?progress=${progress}`)
      .then(res => res.json())
      .then(data => {
        // El Backend devuelve [lon, lat], Leaflet espera [lat, lon]
        setBusPos([data[1], data[0]]);
      })
      .catch(err => console.error('Error en simulación:', err));
  }, [routeId, progress, API_URL]);

  if (!route) return (
    <div className="flex items-center justify-center h-[600px] bg-slate-100 rounded-xl animate-pulse">
      <p className="text-slate-500 font-medium">Cargando mapa de Arequipa...</p>
    </div>
  );

  const polylinePositions = route.path?.map((c: [number, number]) => [c[1], c[0]]) || [];

  return (
    <div className="relative w-full overflow-hidden border border-slate-200 shadow-xl rounded-2xl">
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md border border-slate-200">
        <h4 className="text-sm font-bold text-slate-800">{route.name}</h4>
        <p className="text-xs text-slate-500">Bus: V4K-900 (En tránsito)</p>
        <div className="mt-2 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-1000" 
            style={{ width: `${(progress * 100).toFixed(0)}%` }}
          />
        </div>
      </div>

      <MapContainer 
        center={[-16.4350, -71.5150]} 
        zoom={13} 
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        
        {polylinePositions.length > 0 && (
          <Polyline 
            positions={polylinePositions} 
            color="#2563eb" 
            weight={6} 
            opacity={0.6} 
            dashArray="1, 10" // Estilo punteado para simular ruta
          />
        )}
        
        {busPos && (
          <Marker position={busPos} icon={icon}>
            <Popup>
              <div className="text-center">
                <span className="font-bold text-blue-600">Bus SIT T1</span><br />
                Arequipa - Characato<br />
                <span className="text-[10px] text-slate-400">Progreso: {(progress * 100).toFixed(1)}%</span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
