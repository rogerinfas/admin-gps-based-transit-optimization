'use client';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { io } from 'socket.io-client';
import { getBackendUrl } from '@/lib/api/types/backend';

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface SimulationMapProps {
  routeIds: string[];
}

interface RouteData {
  id: string;
  name: string;
  code: string;
  outboundPath?: [number, number][];
  returnPath?: [number, number][];
}

interface VehicleData {
  routeId: string;
  busPos: [number, number];
  progress: number;
}

export default function SimulationMap({ routeIds }: SimulationMapProps) {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [vehicles, setVehicles] = useState<Record<string, VehicleData[]>>({});

  // 1. Cargar datos base y conectar a Socket.IO
  useEffect(() => {
    if (routeIds.length === 0) {
      setTimeout(() => {
        setRoutes([]);
        setVehicles({});
      }, 0);
      return;
    }

    const fetchRoutes = async () => {
      try {
        const API_URL = getBackendUrl();
        const data = await Promise.all(
          routeIds.map((id) =>
            fetch(`${API_URL}/routes/${id}`).then((res) => res.json())
          )
        );
        setRoutes(data);
      } catch (err) {
        console.error("Failed to fetch routes:", err);
      }
    };

    fetchRoutes();

    const WS_URL = getBackendUrl().replace("http", "ws");
    const newSocket = io(WS_URL, {
      auth: { token: localStorage.getItem("token") },
    });

    newSocket.on("connect", () => {
      routeIds.forEach((id) => newSocket.emit("subscribeToRoute", id));
    });

    newSocket.on("routeSimulationUpdate", (data: { routeId: string; vehicles: VehicleData[] }) => {
      setVehicles((prev) => ({
        ...prev,
        [data.routeId]: data.vehicles,
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [routeIds]);

  if (routes.length === 0) return (
    <div className="flex items-center justify-center h-[600px] bg-slate-100 rounded-xl animate-pulse">
      <p className="text-slate-500 font-medium">Cargando mapa de Arequipa...</p>
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden border border-slate-200 shadow-xl rounded-2xl">
      <MapContainer 
        center={[-16.4350, -71.5150]} 
        zoom={13} 
        style={{ height: '600px', width: '100%' }}
        preferCanvas={true}
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
        />
        
        {/* Render paths for all subscribed routes */}
        {routes.map((route, i) => {
          const polylinePositionsOutbound = route.outboundPath?.map((c: [number, number]) => [c[1], c[0]]) || [];
          const polylinePositionsReturn = route.returnPath?.map((c: [number, number]) => [c[1], c[0]]) || [];
          const color = `hsl(${(i * 137.5) % 360}, 70%, 50%)`; // Generate distinct colors

          return (
            <div key={route.id}>
              {polylinePositionsOutbound.length > 0 && (
                <Polyline 
                  positions={polylinePositionsOutbound as [number, number][]} 
                  color={color} 
                  weight={5} 
                  opacity={0.6} 
                  dashArray="1, 10" 
                />
              )}
              {polylinePositionsReturn.length > 0 && (
                <Polyline 
                  positions={polylinePositionsReturn as [number, number][]} 
                  color={color} 
                  weight={4} 
                  opacity={0.4} 
                  dashArray="5, 10" 
                />
              )}
            </div>
          );
        })}
        
        {/* Render vehicles for all subscribed routes */}
        {Object.values(vehicles).map(vehicle => {
          const route = routes.find(r => r.id === vehicle.routeId);
          if (!route) return null;

          return (
            <Marker key={vehicle.routeId} position={vehicle.busPos} icon={icon}>
              <Popup>
                <div className="text-center">
                  <span className="font-bold text-blue-600">Bus {route.name}</span><br />
                  <span className="text-xs text-slate-500">Ruta: {route.code}</span><br />
                  <span className="text-[10px] text-slate-400">Progreso: {(vehicle.progress * 100).toFixed(1)}%</span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
