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

const stopIcon = L.divIcon({
  className: 'custom-stop-icon',
  html: `
    <div class="relative flex items-center justify-center h-8 w-8 bg-emerald-500 border border-white rounded-full shadow-lg overflow-hidden">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      <span class="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75"></span>
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
  color?: string;
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
  const [focusedPath, setFocusedPath] = useState<string | null>(null); // e.g. "routeId-outbound" or "routeId-return"

  // Nuevos estados para ETA
  const [nearestStop, setNearestStop] = useState<{
    stopId?: string;
    name: string;
    latitude: number;
    longitude: number;
    distanceMeters: number;
    etaSeconds: number;
  } | null>(null);

  const [busArrival, setBusArrival] = useState<{
    etaSeconds: number;
    distanceMeters: number;
    speedKph: number;
    hasPassed?: boolean;
  } | null>(null);

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

  // 1. Calcular el punto de la ruta más cercano al usuario (Paradero Virtual / Intersección)
  // y consultar OSRM para obtener la ruta peatonal exacta con distancia y tiempo de caminata real.
  useEffect(() => {
    if (!userLocation || routes.length === 0 || routeIds.length === 0) {
      Promise.resolve().then(() => {
        setNearestStop(null);
        setConnectionPath([]);
      });
      return;
    }

    const startPoint = userLocation;
    const routeId = routeIds[0];

    const getRoute = async () => {
      try {
        const API_URL = getBackendUrl();
        const nearestStopRes = await fetch(
          `${API_URL}/eta/nearest-stop?lat=${startPoint[0]}&lng=${startPoint[1]}&routeId=${routeId}`
        );
        const nearestStopData = await nearestStopRes.json();

        if (!nearestStopData || !nearestStopData.latitude) {
          setNearestStop(null);
          setConnectionPath([]);
          return;
        }

        const endPoint: [number, number] = [nearestStopData.latitude, nearestStopData.longitude];

        const url = `https://router.project-osrm.org/route/v1/foot/${startPoint[1]},${startPoint[0]};${endPoint[1]},${endPoint[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        
        let distanceMeters = nearestStopData.distanceMeters;
        let etaSeconds = nearestStopData.etaSeconds;

        if (data.routes && data.routes.length > 0) {
          const osrmRoute = data.routes[0];
          const coords = osrmRoute.geometry.coordinates; // [[lon, lat], ...]
          setConnectionPath(coords.map((c: [number, number]) => [c[1], c[0]]));
          distanceMeters = Math.round(osrmRoute.distance);
          etaSeconds = Math.round(osrmRoute.duration);
        } else {
          setConnectionPath([startPoint, endPoint]);
        }

        setNearestStop({
          stopId: nearestStopData.stopId,
          name: nearestStopData.name,
          latitude: endPoint[0],
          longitude: endPoint[1],
          distanceMeters,
          etaSeconds,
        });
      } catch (err) {
        console.error("OSRM Pedestrian error:", err);
        // Fallback simple distance if API fails
        setNearestStop(null);
        setConnectionPath([]);
      }
    };

    getRoute();
  }, [userLocation, routes, routeIds]);

  // 2. Calcular reactivamente el ETA del bus más cercano a la intersección
  // Este hook corre en el cliente en base al progreso WebSocket del bus
  useEffect(() => {
    if (!nearestStop || routeIds.length === 0 || routes.length === 0) {
      Promise.resolve().then(() => setBusArrival(null));
      return;
    }

    const routeId = routeIds[0];
    const route = routes.find(r => r.id === routeId);
    const busGroup = vehicles[routeId];

    if (!route || !busGroup || busGroup.length === 0 || !route.outboundPath) {
      Promise.resolve().then(() => setBusArrival(null));
      return;
    }

    const vehicle = busGroup[0]; // bus en circulación
    const progress = vehicle.progress; // Progreso global de la simulación (0.0 a 1.0)

    // Obtener trayectos ida (outbound) y retorno (return)
    const outboundPath = route.outboundPath;
    const returnPath = route.returnPath || [...outboundPath].reverse();

    // Calcular longitud geodésica de ida y retorno
    let outboundLength = 0;
    for (let i = 0; i < outboundPath.length - 1; i++) {
      outboundLength += L.latLng(outboundPath[i][1], outboundPath[i][0]).distanceTo(
        L.latLng(outboundPath[i+1][1], outboundPath[i+1][0])
      );
    }

    let returnLength = 0;
    for (let i = 0; i < returnPath.length - 1; i++) {
      returnLength += L.latLng(returnPath[i][1], returnPath[i][0]).distanceTo(
        L.latLng(returnPath[i+1][1], returnPath[i+1][0])
      );
    }

    // Determinar en qué tramo (ida o retorno) está más cerca el paradero virtual del usuario
    let minOutboundDist = Infinity;
    let closestOutboundIdx = 0;
    outboundPath.forEach((c, idx) => {
      const dist = Math.pow(c[1] - nearestStop.latitude, 2) + Math.pow(c[0] - nearestStop.longitude, 2);
      if (dist < minOutboundDist) {
        minOutboundDist = dist;
        closestOutboundIdx = idx;
      }
    });

    let minReturnDist = Infinity;
    let closestReturnIdx = 0;
    returnPath.forEach((c, idx) => {
      const dist = Math.pow(c[1] - nearestStop.latitude, 2) + Math.pow(c[0] - nearestStop.longitude, 2);
      if (dist < minReturnDist) {
        minReturnDist = dist;
        closestReturnIdx = idx;
      }
    });

    const stopIsOnOutbound = minOutboundDist <= minReturnDist;

    // Calcular distancia de la parada desde el inicio de su tramo correspondiente
    let stopDistance = 0;
    if (stopIsOnOutbound) {
      for (let i = 0; i < closestOutboundIdx; i++) {
        stopDistance += L.latLng(outboundPath[i][1], outboundPath[i][0]).distanceTo(
          L.latLng(outboundPath[i+1][1], outboundPath[i+1][0])
        );
      }
    } else {
      for (let i = 0; i < closestReturnIdx; i++) {
        stopDistance += L.latLng(returnPath[i][1], returnPath[i][0]).distanceTo(
          L.latLng(returnPath[i+1][1], returnPath[i+1][0])
        );
      }
    }

    // Calcular la posición y distancia restante en base a si el bus está en ida (<= 0.5) o retorno (> 0.5)
    let remainingDistance = 0;
    let hasPassed = false;

    if (progress <= 0.5) {
      // El bus está en la ida (outbound) -> progreso escala de 0.0 a 1.0 en outbound
      const outboundProgress = progress * 2;
      const busDistance = outboundLength * outboundProgress;

      if (stopIsOnOutbound) {
        remainingDistance = stopDistance - busDistance;
        if (remainingDistance < 0) {
          if (Math.abs(remainingDistance) < 300) {
            hasPassed = true;
          }
          // El bus ya pasó el paradero de ida, debe completar la ida, el retorno entero y volver a la parada
          remainingDistance = (outboundLength - busDistance) + returnLength + stopDistance;
        }
      } else {
        // La parada está en el retorno, el bus debe llegar al fin de ida y avanzar en el retorno
        remainingDistance = (outboundLength - busDistance) + stopDistance;
      }
    } else {
      // El bus está en el retorno (return) -> progreso escala de 0.0 a 1.0 en return
      const returnProgress = (progress - 0.5) * 2;
      const busDistance = returnLength * returnProgress;

      if (!stopIsOnOutbound) {
        remainingDistance = stopDistance - busDistance;
        if (remainingDistance < 0) {
          if (Math.abs(remainingDistance) < 300) {
            hasPassed = true;
          }
          // El bus ya pasó el paradero de retorno, debe completar retorno, ida entera y volver a la parada
          remainingDistance = (returnLength - busDistance) + outboundLength + stopDistance;
        }
      } else {
        // La parada está en la ida, el bus debe terminar retorno y avanzar en la ida
        remainingDistance = (returnLength - busDistance) + stopDistance;
      }
    }

    const busSpeedKph = 25; // 25 km/h
    const busSpeedMps = busSpeedKph / 3.6;
    const etaSeconds = Math.round(remainingDistance / busSpeedMps);

    Promise.resolve().then(() => {
      setBusArrival({ 
        etaSeconds, 
        distanceMeters: Math.round(remainingDistance),
        speedKph: busSpeedKph,
        hasPassed 
      });
    });
  }, [nearestStop, routeIds, routes, vehicles]);
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
          const outboundColor = route.color || `hsl(${(i * 137.5) % 360}, 75%, 50%)`;
          const returnColor = route.color || `hsl(${((i * 137.5) + 35) % 360}, 70%, 55%)`; // Distinct, harmonious color for return path

          return (
            <div key={route.id}>
              {polylinePositionsOutbound.length > 0 && (() => {
                const pathKey = `${route.id}-outbound`;
                const isFocused = focusedPath === pathKey;
                return (
                  <Polyline 
                    positions={polylinePositionsOutbound as [number, number][]} 
                    color={outboundColor} 
                    weight={isFocused ? 8 : 5} 
                    opacity={isFocused ? 1 : (route.color ? 0.85 : 0.7)} 
                    dashArray={isFocused ? undefined : "1, 10"}
                    eventHandlers={{
                      click: (e) => {
                        setFocusedPath(prev => prev === pathKey ? null : pathKey);
                        const map = e.target._map;
                        if (map) {
                          map.fitBounds(e.target.getBounds(), { padding: [50, 50] });
                        }
                      }
                    }}
                  />
                );
              })()}
              {polylinePositionsReturn.length > 0 && (() => {
                const pathKey = `${route.id}-return`;
                const isFocused = focusedPath === pathKey;
                return (
                  <Polyline 
                    positions={polylinePositionsReturn as [number, number][]} 
                    color={returnColor} 
                    weight={isFocused ? 7 : 4} 
                    opacity={isFocused ? 0.95 : (route.color ? 0.35 : 0.55)} 
                    dashArray={isFocused ? undefined : "5, 10"}
                    eventHandlers={{
                      click: (e) => {
                        setFocusedPath(prev => prev === pathKey ? null : pathKey);
                        const map = e.target._map;
                        if (map) {
                          map.fitBounds(e.target.getBounds(), { padding: [50, 50] });
                        }
                      }
                    }}
                  />
                );
              })()}
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

        {/* Render nearest stop intersection marker */}
        {nearestStop && (
          <Marker position={[nearestStop.latitude, nearestStop.longitude]} icon={stopIcon}>
            <Popup>
              <div className="text-center p-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">Punto de Conexión (ETA)</span><br />
                <span className="text-sm font-semibold tracking-tight">{nearestStop.name}</span><br />
                <span className="text-[10px] text-muted-foreground">Distancia: {nearestStop.distanceMeters}m</span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Premium Glassmorphism ETA Panel */}
      {nearestStop && (
        <div className="absolute top-4 right-4 z-[9999] max-w-[320px] bg-white/90 dark:bg-black/90 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-2xl p-4 shadow-xl select-none animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-primary animate-ping"></span>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Panel de Arribo (ETA)
            </h4>
          </div>

          <div className="space-y-4">
            {/* Paradero Peatonal */}
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-footprints"><path d="M4 16v-2.38C4 11.5 5.88 9.85 6 7.07l.02-1.89c.02-.75-.38-1.54-.3-2.29.09-.76.7-1.39 1.48-1.39.8 0 1.25.6 1.27 1.4l.02 1.89c.02.73-.2 1.63-.44 2.37l-.63 2.01A5.62 5.62 0 0 0 7 14.88V16"/><path d="M12 18.5V16c0-2.12 1.88-3.77 2-6.55l.02-1.89c.02-.75-.38-1.54-.3-2.29.09-.76.7-1.39 1.48-1.39.8 0 1.25.6 1.27 1.4l.02 1.89c.02.73-.2 1.63-.44 2.37l-.63 2.01A5.62 5.62 0 0 0 15 17.38V18.5"/><path d="M5 21a2 2 0 0 0 2-2v-.5a2 2 0 0 0-4 0v.5a2 2 0 0 0 2 2Z"/><path d="M13 22.5a2 2 0 0 0 2-2v-.5a2 2 0 0 0-4 0v.5a2 2 0 0 0 2 2Z"/></svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Intersección de Conexión</p>
                <p className="text-sm font-semibold tracking-tight">Paradero Virtual Peatonal</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A {nearestStop.distanceMeters}m ({Math.ceil(nearestStop.etaSeconds / 60)} min de caminata)
                </p>
              </div>
            </div>

             {/* Bus de Arribo */}
             <div className="flex gap-3 pt-3 border-t border-border/40">
               <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bus"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h20"/><path d="M26 12v6c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1v-6"/><path d="M6 18H3"/><path d="M21 18h-3"/><path d="M10 22h4"/><path d="M19 22H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2Z"/></svg>
               </div>
               <div className="flex-1">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Próximo Bus de Ruta</p>
                 {busArrival ? (
                   <>
                     <p className="text-sm font-semibold tracking-tight text-primary">
                       {busArrival.hasPassed ? (
                         <span className="text-red-500 font-bold animate-pulse">¡El bus ya pasó tu paradero!</span>
                       ) : busArrival.etaSeconds < 30 ? (
                         <span className="text-emerald-500 font-bold animate-pulse">¡Llegando al paradero!</span>
                       ) : (
                         `Arriba en ${Math.ceil(busArrival.etaSeconds / 60)} min`
                       )}
                     </p>
                     
                     {/* Premium Telemetry Data Grid */}
                     <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground border-t border-border/20 pt-1.5">
                       <div>
                         <span className="font-medium">Distancia:</span>{" "}
                         <span className="font-semibold text-foreground">
                           {busArrival.distanceMeters >= 1000 
                             ? `${(busArrival.distanceMeters / 1000).toFixed(2)} km` 
                             : `${busArrival.distanceMeters} m`
                           }
                         </span>
                       </div>
                       <div>
                         <span className="font-medium">Velocidad:</span>{" "}
                         <span className="font-semibold text-foreground">{busArrival.speedKph} km/h</span>
                       </div>
                     </div>

                     <p className="text-[9px] text-muted-foreground mt-1.5 italic">
                       {busArrival.hasPassed 
                         ? "El bus acaba de pasar. Mostrando datos del siguiente viaje."
                         : "Estimación real basada en telemetría de bus"
                       }
                     </p>
                   </>
                 ) : (
                   <p className="text-xs text-muted-foreground italic mt-0.5">
                     Esperando señal del bus...
                   </p>
                 )}
               </div>
             </div>
          </div>
        </div>
      )}

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
