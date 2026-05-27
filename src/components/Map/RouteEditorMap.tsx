'use client';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMapEvents, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import { getBackendUrl } from '@/lib/api/types/backend';

interface RouteEditorMapProps {
  routeId: string;
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function RouteEditorMap({ routeId }: RouteEditorMapProps) {
  const [route, setRoute] = useState<{ name: string; outboundPath?: [number, number][]; returnPath?: [number, number][] } | null>(null);
  
  const [direction, setDirection] = useState<'outbound' | 'return'>('outbound');

  // Outbound states
  const [waypointsOutbound, setWaypointsOutbound] = useState<[number, number][]>([]);
  const [snappedPathOutbound, setSnappedPathOutbound] = useState<[number, number][]>([]);

  // Return states
  const [waypointsReturn, setWaypointsReturn] = useState<[number, number][]>([]);
  const [snappedPathReturn, setSnappedPathReturn] = useState<[number, number][]>([]);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = getBackendUrl();

  // Load initial route from backend
  useEffect(() => {
    if (!routeId) return;
    fetch(`${API_URL}/routes/${routeId}`)
      .then(res => res.json())
      .then(data => {
        setRoute(data);
        if (data.outboundPath && data.outboundPath.length > 0) {
          const dbPath = data.outboundPath.map((c: [number, number]) => [c[1], c[0]]);
          setSnappedPathOutbound(dbPath);
          setWaypointsOutbound([dbPath[0], dbPath[dbPath.length - 1]]);
        }
        if (data.returnPath && data.returnPath.length > 0) {
          const dbPath = data.returnPath.map((c: [number, number]) => [c[1], c[0]]);
          setSnappedPathReturn(dbPath);
          setWaypointsReturn([dbPath[0], dbPath[dbPath.length - 1]]);
        }
      })
      .catch(err => console.error('Error cargando ruta:', err));
  }, [routeId, API_URL]);

  const fetchRouteFromOSRM = async (waypoints: [number, number][], setter: (path: [number, number][]) => void) => {
    if (waypoints.length < 2) {
      if (waypoints.length === 1) setter([]);
      return;
    }
    setIsRouting(true);
    setError(null);
    try {
      const coordsStr = waypoints.map(wp => `${wp[1]},${wp[0]}`).join(';');
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`;

      const res = await fetch(osrmUrl);
      if (!res.ok) throw new Error('Error al conectar con OSRM');
      const data = await res.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('OSRM no pudo encontrar una ruta en esas calles');
      }

      const geojsonCoords = data.routes[0].geometry.coordinates;
      setter(geojsonCoords.map((c: [number, number]) => [c[1], c[0]]));
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsRouting(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchRouteFromOSRM(waypointsOutbound, setSnappedPathOutbound), 300);
    return () => clearTimeout(timeout);
  }, [waypointsOutbound]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchRouteFromOSRM(waypointsReturn, setSnappedPathReturn), 300);
    return () => clearTimeout(timeout);
  }, [waypointsReturn]);


  const handleMapClick = (lat: number, lng: number) => {
    if (direction === 'outbound') {
      setWaypointsOutbound(prev => [...prev, [lat, lng]]);
    } else {
      setWaypointsReturn(prev => [...prev, [lat, lng]]);
    }
  };

  const handleUndo = () => {
    if (direction === 'outbound') setWaypointsOutbound(prev => prev.slice(0, -1));
    else setWaypointsReturn(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (direction === 'outbound') {
      setWaypointsOutbound([]);
      setSnappedPathOutbound([]);
    } else {
      setWaypointsReturn([]);
      setSnappedPathReturn([]);
    }
  };

  const handleSave = async () => {
    if (!routeId) return;
    setIsSaving(true);
    setError(null);
    try {
      const finalOutbound = snappedPathOutbound.length > 0 ? snappedPathOutbound : waypointsOutbound;
      const finalReturn = snappedPathReturn.length > 0 ? snappedPathReturn : waypointsReturn;
      
      const payload: Record<string, unknown> = {};
      
      if (finalOutbound.length > 0) {
        payload.outboundPathGeoJson = {
          type: "LineString",
          coordinates: finalOutbound.map(p => [p[1], p[0]])
        };
      }
      
      if (finalReturn.length > 0) {
        payload.returnPathGeoJson = {
          type: "LineString",
          coordinates: finalReturn.map(p => [p[1], p[0]])
        };
      }

      const res = await fetch(`${API_URL}/routes/${routeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Error al guardar en el servidor');
      
      alert('Rutas guardadas exitosamente');
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!route) return (
    <div className="flex items-center justify-center h-[600px] bg-slate-100 rounded-xl animate-pulse">
      <p className="text-slate-500 font-medium">Cargando editor de ruta...</p>
    </div>
  );

  const activeWaypoints = direction === 'outbound' ? waypointsOutbound : waypointsReturn;
  const activeSnapped = direction === 'outbound' ? snappedPathOutbound : snappedPathReturn;

  return (
    <div className="relative w-full overflow-hidden border border-slate-200 shadow-xl rounded-2xl flex flex-col">
      <div className="bg-white p-4 flex justify-between items-center border-b border-slate-200 z-10 relative">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold text-slate-800">Editando: {route.name}</h3>
          
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setDirection('outbound')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${direction === 'outbound' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Ruta IDA (Azul)
            </button>
            <button
              onClick={() => setDirection('return')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${direction === 'return' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Ruta REGRESO (Naranja)
            </button>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {isRouting && <span className="text-xs text-blue-600 font-medium animate-pulse mr-2">Calculando ruta...</span>}
          <button 
            onClick={handleUndo} 
            disabled={activeWaypoints.length === 0}
            className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
          >
            Deshacer
          </button>
          <button 
            onClick={handleClear} 
            disabled={activeWaypoints.length === 0 && activeSnapped.length === 0}
            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            Limpiar {direction === 'outbound' ? 'Ida' : 'Regreso'}
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSaving ? 'Guardando...' : 'Guardar Todo'}
          </button>
        </div>
      </div>
      {error && <div className="bg-red-100 text-red-700 p-2 text-sm text-center z-10 relative">{error}</div>}

      <MapContainer 
        center={[-16.4350, -71.5150]} 
        zoom={14} 
        style={{ height: '600px', width: '100%' }}
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> & OSRM'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        
        <MapEvents onMapClick={handleMapClick} />

        {/* OUTBOUND PATH */}
        {snappedPathOutbound.length > 0 && (
          <Polyline positions={snappedPathOutbound} color="#2563eb" weight={5} opacity={0.8} />
        )}
        {waypointsOutbound.map((wp, i) => (
          <CircleMarker 
            key={`out-${i}`} 
            center={wp} 
            radius={i === 0 ? 8 : (i === waypointsOutbound.length - 1 ? 8 : 5)} 
            color="#1e40af" 
            fillColor={i === 0 ? "#22c55e" : (i === waypointsOutbound.length - 1 ? "#ef4444" : "#ffffff")} 
            fillOpacity={1} 
            weight={2}
          >
            <Tooltip>{i === 0 ? "Inicio Ida" : (i === waypointsOutbound.length - 1 ? "Fin Ida" : `Punto ${i + 1} Ida`)}</Tooltip>
          </CircleMarker>
        ))}

        {/* RETURN PATH */}
        {snappedPathReturn.length > 0 && (
          <Polyline positions={snappedPathReturn} color="#ea580c" weight={5} opacity={0.8} dashArray="10, 10" />
        )}
        {waypointsReturn.map((wp, i) => (
          <CircleMarker 
            key={`ret-${i}`} 
            center={wp} 
            radius={i === 0 ? 8 : (i === waypointsReturn.length - 1 ? 8 : 5)} 
            color="#c2410c" 
            fillColor={i === 0 ? "#22c55e" : (i === waypointsReturn.length - 1 ? "#ef4444" : "#ffffff")} 
            fillOpacity={1} 
            weight={2}
          >
            <Tooltip>{i === 0 ? "Inicio Regreso" : (i === waypointsReturn.length - 1 ? "Fin Regreso" : `Punto ${i + 1} Regreso`)}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
