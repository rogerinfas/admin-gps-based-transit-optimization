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

function FitBoundsController({
  triggerFitBounds,
  routes,
  onComplete,
}: {
  triggerFitBounds: boolean;
  routes: RouteData[];
  onComplete: () => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (triggerFitBounds && routes.length > 0) {
      const points: [number, number][] = [];
      routes.forEach((route) => {
        route.outboundPath?.forEach((c) => points.push([c[1], c[0]]));
        route.returnPath?.forEach((c) => points.push([c[1], c[0]]));
      });
      if (points.length > 0) {
        map.fitBounds(points, { padding: [50, 50] });
      }
      onComplete();
    }
  }, [triggerFitBounds, routes, map, onComplete]);
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
  const [triggerFitBounds, setTriggerFitBounds] = useState(false);
  const [hasNotifiedError, setHasNotifiedError] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [connectionPath, setConnectionPath] = useState<[number, number][]>([]);

  // Validar si las coordenadas están en el rango geográfico aproximado de Arequipa
  const isNearArequipa = (lat: number, lon: number) => {
    return lat < -15.5 && lat > -17.2 && lon < -70.8 && lon > -72.2;
  };

  const handleRecenterClick = () => {
    setIsManual(false); // Permitir que el GPS vuelva a actualizar si el usuario lo solicita
    if (userLocation && isNearArequipa(userLocation[0], userLocation[1])) {
      setTriggerRecenter(true);
    } else {
      if (typeof window !== "undefined" && "geolocation" in navigator) {
        toast.promise(
          new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                if (isNearArequipa(lat, lon)) {
                  setUserLocation([lat, lon]);
                  setTriggerRecenter(true);
                  resolve(position);
                } else {
                  reject(new Error("Fuera de rango"));
                }
              },
              (err) => {
                reject(err);
              },
              { enableHighAccuracy: true }
            );
          }),
          {
            loading: 'Obteniendo tu ubicación satelital...',
            success: '¡Ubicación encontrada en Arequipa!',
            error: 'Ubicación GPS fuera de Arequipa o no disponible. Haz clic en el mapa.',
          }
        );
      }
    }
  };

  // 1. Monitorear geolocalización del usuario en tiempo real
  useEffect(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (isManual) return; // No sobrescribir si el usuario la fijó manualmente

          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          if (isNearArequipa(lat, lon)) {
            setUserLocation([lat, lon]);
            setIsEditingLocation(false);
          } else if (!hasNotifiedError) {
            // Si la ubicación GPS por defecto es inválida/mocked fuera de Arequipa
            toast.info("La señal GPS de tu navegador está fuera de Arequipa. ¡Haz clic en el mapa para ubicarte manualmente!");
            setHasNotifiedError(true);
            setIsEditingLocation(true);
          }
        },
        () => {
          if (!hasNotifiedError) {
            toast.info("No pudimos obtener tu ubicación automáticamente. ¡Puedes hacer clic en cualquier parte del mapa para ubicarte manualmente!");
            setHasNotifiedError(true);
            setIsEditingLocation(true);
          }
        },
        { enableHighAccuracy: true }
      );
      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [hasNotifiedError, isManual]);

  const handleMapClick = (latlng: L.LatLng) => {
    if (!isEditingLocation && userLocation !== null) return;
    setUserLocation([latlng.lat, latlng.lng]);
    setIsManual(true); // Bloquear futuras sobrescrituras del GPS automático
    setIsEditingLocation(false);
    toast.success("Ubicación actualizada y bloqueada en el mapa.");
  };
  // Función para obtener la ruta peatonal desde OSRM
  const fetchWalkingRoute = async (start: [number, number], end: [number, number]): Promise<[number, number][]> => {
    try {
      const url = `https://router.project-osrm.org/route/v1/foot/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const coords = data.routes[0].geometry.coordinates; // [[lon, lat], ...]
        return coords.map((c: [number, number]) => [c[1], c[0]]); // [lat, lon]
      }
    } catch (err) {
      console.error("OSRM Routing error:", err);
    }
    // Fallback: Línea recta
    return [start, end];
  };

  // Calcular y actualizar la ruta peatonal más cercana
  useEffect(() => {
    if (!userLocation || routes.length === 0) {
      Promise.resolve().then(() => setConnectionPath([]));
      return;
    }

    let bestRoutePoint: [number, number] | null = null;
    let minDistance = Infinity;

    routes.forEach((route) => {
      route.outboundPath?.forEach((c) => {
        const lat = c[1];
        const lon = c[0];
        const dist = Math.pow(lat - userLocation[0], 2) + Math.pow(lon - userLocation[1], 2);
        if (dist < minDistance) {
          minDistance = dist;
          bestRoutePoint = [lat, lon];
        }
      });
      route.returnPath?.forEach((c) => {
        const lat = c[1];
        const lon = c[0];
        const dist = Math.pow(lat - userLocation[0], 2) + Math.pow(lon - userLocation[1], 2);
        if (dist < minDistance) {
          minDistance = dist;
          bestRoutePoint = [lat, lon];
        }
      });
    });

    if (!bestRoutePoint) {
      Promise.resolve().then(() => setConnectionPath([]));
      return;
    }

    const startPoint = userLocation;
    const endPoint = bestRoutePoint;

    const getRoute = async () => {
      const path = await fetchWalkingRoute(startPoint, endPoint);
      setConnectionPath(path);
    };

    getRoute();
  }, [userLocation, routes]);
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

    // En producción (HTTPS), Socket.IO debe conectar al origen de la propia
    // página para que el rewrite de Next.js (/socket.io → backend) funcione.
    // Conectar directo al WSS del backend falla porque el navegador rechaza
    // la conexión cuando no pasa a través del proxy (Traefik → Next.js → NestJS).
    const isHttps =
      typeof window !== "undefined" && window.location.protocol === "https:";

    const WS_URL = isHttps
      ? window.location.origin  // usa el rewrite /socket.io de next.config.ts
      : getBackendUrl().replace(/^http/, "ws");

    const socketOptions: {
      auth: { token: string | null };
      path?: string;
    } = {
      auth: { token: localStorage.getItem("token") },
    };

    // En producción el path ya queda /socket.io (por el rewrite), no es necesario cambiarlo.
    // En desarrollo apunta directo al backend NestJS.

    const newSocket = io(WS_URL, socketOptions);

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

        <FitBoundsController
          triggerFitBounds={triggerFitBounds}
          routes={routes}
          onComplete={() => setTriggerFitBounds(false)}
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

        {/* Render connection path from user location to closest route point */}
        {connectionPath.length > 0 && (
          <Polyline 
            positions={connectionPath} 
            color="#6b6b6b" 
            weight={4} 
            opacity={0.8} 
            dashArray="5, 8" 
          />
        )}
      </MapContainer>

      {/* Floating Control Group (Bottom-Right) */}
      <div className="absolute bottom-5 right-5 z-[400] flex flex-col gap-2">
        {/* Toggle Edit Location Mode */}
        <button
          type="button"
          onClick={() => {
            setIsEditingLocation((prev) => !prev);
            if (!isEditingLocation) {
              toast.info("Modo Edición: Haz clic en cualquier parte del mapa para ubicarte.");
            }
          }}
          className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-lg active:scale-95 transition ${isEditingLocation ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-black border-black/10 hover:bg-neutral-50'}`}
          title="Cambiar mi ubicación en el mapa"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>

        {/* Recenter on GPS */}
        <button
          type="button"
          onClick={handleRecenterClick}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-black/10 shadow-lg hover:bg-neutral-50 active:scale-95 transition text-black"
          title="Centrar en mi ubicación"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        </button>
      </div>
    </div>
  );
}
