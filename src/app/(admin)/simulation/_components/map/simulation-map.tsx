'use client';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import { io } from 'socket.io-client';
import { getBackendUrl } from '@/lib/api/types/backend';
import { toast } from 'sonner';

const icon = L.divIcon({
  className: 'custom-bus-icon',
  html: `
    <div class="relative flex items-center justify-center h-9 w-9 bg-white border border-primary/20 rounded-full shadow-md overflow-hidden">
      <img src="/assets/logo.png" class="h-8 w-8 object-contain" />
      <span class="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-60"></span>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const personIcon = L.divIcon({
  className: 'custom-person-icon',
  html: `
    <div class="relative flex items-center justify-center h-8 w-8 bg-white border border-emerald-500/30 rounded-full shadow-md overflow-hidden">
      <img src="/assets/person.png" class="h-6 w-6 object-contain" />
      <span class="absolute inset-0 rounded-full border-2 border-emerald-500 animate-pulse opacity-60"></span>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function RecenterController({ 
  triggerRecenter, 
  position, 
  onComplete 
}: { 
  triggerRecenter: boolean; 
  position: [number, number] | null; 
  onComplete: () => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (triggerRecenter && position) {
      map.setView(position, 16);
      onComplete();
    }
  }, [triggerRecenter, position, map, onComplete]);
  return null;
}

function MapClickHandler({ onClick }: { onClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

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
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [triggerRecenter, setTriggerRecenter] = useState(false);
  const [hasNotifiedError, setHasNotifiedError] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  // 1. Monitorear geolocalización del usuario en tiempo real
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setIsEditingLocation(false); // Lock automatically when GPS updates
        },
        () => {
          if (!hasNotifiedError) {
            toast.info("No pudimos obtener tu ubicación automáticamente. ¡Puedes hacer clic en cualquier parte del mapa para ubicarte manualmente!");
            setHasNotifiedError(true);
            setIsEditingLocation(true); // Allow setting manual location if GPS fails
          }
        },
        { enableHighAccuracy: true }
      );
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [hasNotifiedError]);

  const handleMapClick = (latlng: L.LatLng) => {
    if (!isEditingLocation && userLocation !== null) return;
    setUserLocation([latlng.lat, latlng.lng]);
    setIsEditingLocation(false);
    toast.success("Ubicación actualizada y bloqueada en el mapa.");
  };

  // 2. Cargar datos base y conectar a Socket.IO
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
      newSocket.emit("subscribeToRoutes", routeIds);
    });

    newSocket.on("vehicle_update", (data: { routeId: string; busPos: [number, number]; progress: number }) => {
      setVehicles((prev) => ({
        ...prev,
        [data.routeId]: [data],
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [routeIds]);

  if (routes.length === 0) return (
    <div className="flex items-center justify-center h-[600px] bg-muted rounded-xl animate-pulse">
      <p className="text-muted-foreground font-medium">Cargando mapa de Arequipa...</p>
    </div>
  );

  return (
    <div className="relative w-full overflow-hidden border border-border shadow-xl rounded-2xl">
      {/* Floating Location Controls (Top-Left) */}
      <div className="absolute top-4 left-4 z-[400] bg-white dark:bg-card p-3 rounded-xl shadow-lg border border-black/5 flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider leading-none mb-1">Tu Ubicación</span>
          <span className="text-xs font-semibold text-foreground leading-none">
            {userLocation ? (isEditingLocation ? "Seleccionando..." : "Establecida y bloqueada") : "Sin establecer"}
          </span>
        </div>
        {userLocation ? (
          <button
            type="button"
            onClick={() => {
              setIsEditingLocation(true);
              toast.info("Haz clic en cualquier punto del mapa para cambiar tu ubicación.");
            }}
            className="text-xs font-medium px-2.5 py-1 rounded bg-secondary hover:bg-neutral-200 text-foreground transition"
          >
            Cambiar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingLocation(true)}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-primary text-primary-foreground hover:opacity-90 transition"
          >
            Establecer
          </button>
        )}
      </div>

      {/* Edit Mode Active Banner */}
      {isEditingLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[450] bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg border border-black/10 flex items-center gap-2 animate-pulse">
          <span className="text-xs font-medium">Modo Edición: Haz clic en el mapa para ubicarte</span>
          <button
            type="button"
            onClick={() => setIsEditingLocation(false)}
            className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded hover:bg-white/30 transition text-primary-foreground"
          >
            Listo
          </button>
        </div>
      )}

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

        <RecenterController 
          triggerRecenter={triggerRecenter} 
          position={userLocation} 
          onComplete={() => setTriggerRecenter(false)} 
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
        {Object.values(vehicles).map((vehicleGroup) => {
          return vehicleGroup.map((vehicle, idx) => {
             const route = routes.find(r => r.id === vehicle.routeId);
             if (!route) return null;
             return (
              <Marker key={`${vehicle.routeId}-${idx}`} position={vehicle.busPos} icon={icon}>
                <Popup>
                  <div className="text-center">
                    <span className="font-bold text-primary">Bus {route.name}</span><br />
                    <span className="text-xs text-muted-foreground">Ruta: {route.code}</span><br />
                    <span className="text-[10px] text-muted-foreground">Progreso: {(vehicle.progress * 100).toFixed(1)}%</span>
                  </div>
                </Popup>
              </Marker>
            );
          });
        })}

        {/* Map Click Handler for Manual Geolocation */}
        <MapClickHandler onClick={handleMapClick} />

        {/* Render user's current GPS location */}
        {userLocation && (
          <Marker position={userLocation} icon={personIcon}>
            <Popup>
              <div className="text-center font-semibold text-xs py-0.5">
                Tu ubicación actual
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Action Button to Recenter Map on GPS */}
      {userLocation && (
        <button
          type="button"
          onClick={() => setTriggerRecenter(true)}
          className="absolute bottom-5 right-5 z-[400] flex h-11 w-11 items-center justify-center rounded-full bg-white border border-black/10 shadow-lg hover:bg-neutral-50 active:scale-95 transition text-black"
          title="Centrar en mi ubicación"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        </button>
      )}
    </div>
  );
}
