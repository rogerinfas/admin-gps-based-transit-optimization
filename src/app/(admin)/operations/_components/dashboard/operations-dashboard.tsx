"use client";

import { useMemo, useState, useRef } from "react";
import type {
  OperationsDashboardData,
  RouteItem,
  VehicleItem,
  VehicleStatus,
} from "../../_types/operations.types";
import { useUploadRouteImage } from "../../_hooks/use-upload-route-image";
import {
  useCreateRoute,
  useUpdateRoute,
  useDeleteRoute,
  useCreateVehicle,
  useUpdateVehicle,
  useDeleteVehicle,
} from "../../_hooks/use-operations";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Bus, Route } from "lucide-react";

type Props = {
  data: OperationsDashboardData;
};

const statusClasses: Record<string, string> = {
  ACTIVE: "bg-success/15 text-success",
  INACTIVE: "bg-surface text-muted",
  MAINTENANCE: "bg-warning/15 text-warning",
};

function routeLabel(route: RouteItem): string {
  return `${route.name} (${route.code})`;
}

export default function OperationsDashboard({ data }: Props) {
  const router = useRouter();
  const [selectedRouteId, setSelectedRouteId] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutation } = useUploadRouteImage();
  const isUploading = mutation.isPending;

  // --- CRUD MUTATION HOOKS ---
  const createRouteMutation = useCreateRoute();
  const updateRouteMutation = useUpdateRoute();
  const deleteRouteMutation = useDeleteRoute();
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const deleteVehicleMutation = useDeleteVehicle();

  // --- MODAL STATE ---
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [routeModalMode, setRouteModalMode] = useState<"create" | "edit">("create");
  const [editingRoute, setEditingRoute] = useState<RouteItem | null>(null);

  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [vehicleModalMode, setVehicleModalMode] = useState<"create" | "edit">("create");
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);

  // --- FORM STATE - ROUTE ---
  const [routeCode, setRouteCode] = useState("");
  const [routeName, setRouteName] = useState("");
  const [routeDescription, setRouteDescription] = useState("");
  const [routeIsActive, setRouteIsActive] = useState(true);

  // --- FORM STATE - VEHICLE ---
  const [vehicleCode, setVehicleCode] = useState("");
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState("");
  const [vehicleStatus, setVehicleStatus] = useState<VehicleStatus>("ACTIVE");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [vehicleRouteId, setVehicleRouteId] = useState<string>("");

  const visibleVehicles = useMemo(() => {
    if (selectedRouteId === "all") return data.vehicles;
    return data.vehicles.filter((vehicle) => vehicle.routeId === selectedRouteId);
  }, [data.vehicles, selectedRouteId]);

  const selectedRoute = data.routes.find((route) => route.id === selectedRouteId);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedRoute || !e.target.files?.[0]) return;
    const file = e.target.files[0];

    mutation.mutate(
      { routeId: selectedRoute.id, file },
      {
        onSuccess: () => {
          router.refresh();
        },
        onSettled: () => {
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      },
    );
  };

  // --- ROUTE CRUD HANDLERS ---
  const handleOpenRouteModal = (mode: "create" | "edit", route?: RouteItem) => {
    setRouteModalMode(mode);
    if (mode === "edit" && route) {
      setEditingRoute(route);
      setRouteCode(route.code);
      setRouteName(route.name);
      setRouteDescription(route.description ?? "");
      setRouteIsActive(route.isActive);
    } else {
      setEditingRoute(null);
      setRouteCode("");
      setRouteName("");
      setRouteDescription("");
      setRouteIsActive(true);
    }
    setRouteModalOpen(true);
  };

  const handleRouteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (routeModalMode === "create") {
      createRouteMutation.mutate(
        {
          code: routeCode,
          name: routeName,
          description: routeDescription || null,
          isActive: routeIsActive,
        },
        {
          onSuccess: () => {
            setRouteModalOpen(false);
            router.refresh();
          },
        }
      );
    } else if (routeModalMode === "edit" && editingRoute) {
      updateRouteMutation.mutate(
        {
          id: editingRoute.id,
          code: routeCode,
          name: routeName,
          description: routeDescription || null,
          isActive: routeIsActive,
        },
        {
          onSuccess: () => {
            setRouteModalOpen(false);
            router.refresh();
          },
        }
      );
    }
  };

  const handleDeleteRoute = (routeId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta ruta? Esta acción también desvinculará sus paradas y vehículos asociados.")) {
      deleteRouteMutation.mutate(routeId, {
        onSuccess: () => {
          if (selectedRouteId === routeId) {
            setSelectedRouteId("all");
          }
          router.refresh();
        },
      });
    }
  };

  // --- VEHICLE CRUD HANDLERS ---
  const handleOpenVehicleModal = (mode: "create" | "edit", vehicle?: VehicleItem) => {
    setVehicleModalMode(mode);
    if (mode === "edit" && vehicle) {
      setEditingVehicle(vehicle);
      setVehicleCode(vehicle.code);
      setVehiclePlateNumber(vehicle.plateNumber ?? "");
      setVehicleStatus(vehicle.status);
      setVehicleCapacity(vehicle.capacity ? vehicle.capacity.toString() : "");
      setVehicleRouteId(vehicle.routeId ?? "none");
    } else {
      setEditingVehicle(null);
      setVehicleCode("");
      setVehiclePlateNumber("");
      setVehicleStatus("ACTIVE");
      setVehicleCapacity("");
      // Default to selected route ID if not 'all'
      setVehicleRouteId(selectedRouteId !== "all" ? selectedRouteId : "none");
    }
    setVehicleModalOpen(true);
  };

  const handleVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const capacityVal = vehicleCapacity ? parseInt(vehicleCapacity, 10) : null;
    const routeIdVal = vehicleRouteId === "none" || !vehicleRouteId ? null : vehicleRouteId;

    if (vehicleModalMode === "create") {
      createVehicleMutation.mutate(
        {
          code: vehicleCode,
          plateNumber: vehiclePlateNumber || null,
          status: vehicleStatus,
          capacity: capacityVal,
          routeId: routeIdVal,
        },
        {
          onSuccess: () => {
            setVehicleModalOpen(false);
            router.refresh();
          },
        }
      );
    } else if (vehicleModalMode === "edit" && editingVehicle) {
      updateVehicleMutation.mutate(
        {
          id: editingVehicle.id,
          code: vehicleCode,
          plateNumber: vehiclePlateNumber || null,
          status: vehicleStatus,
          capacity: capacityVal,
          routeId: routeIdVal,
        },
        {
          onSuccess: () => {
            setVehicleModalOpen(false);
            router.refresh();
          },
        }
      );
    }
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta unidad de servicio?")) {
      deleteVehicleMutation.mutate(vehicleId, {
        onSuccess: () => {
          router.refresh();
        },
      });
    }
  };

  return (
    <>
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
            Arequipa - Centro de Operaciones
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            TransiGo Ops Panel
          </h1>
        </div>
      </section>

      <section className="mt-8 flex flex-col gap-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Rutas Totales</p>
            <p className="mt-2 text-3xl font-semibold">{data.totals.routes}</p>
          </article>
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Rutas Activas</p>
            <p className="mt-2 text-3xl font-semibold">{data.totals.activeRoutes}</p>
          </article>
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Flota Total</p>
            <p className="mt-2 text-3xl font-semibold">{data.totals.vehicles}</p>
          </article>
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Buses Activos</p>
            <p className="mt-2 text-3xl font-semibold">{data.totals.activeVehicles}</p>
          </article>
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">En Mantenimiento</p>
            <p className="mt-2 text-3xl font-semibold">{data.totals.maintenanceVehicles}</p>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* SIDEBAR: RUTAS */}
          <aside className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10 h-fit">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Route className="w-5 h-5 text-muted" />
                Corredores de Ruta
              </h2>
              <button
                type="button"
                onClick={() => handleOpenRouteModal("create")}
                className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-contrast hover:opacity-90 active:scale-95 transition flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Nueva
              </button>
            </div>
            <p className="mt-1 text-sm text-muted">Flujo estilo despacho Uber para monitoreo por corredor.</p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setSelectedRouteId("all")}
                className={`rounded-xl px-3 py-2 text-left text-sm ring-1 ring-foreground/10 transition cursor-pointer ${
                  selectedRouteId === "all" ? "bg-primary text-primary-contrast" : "bg-surface hover:bg-surface/80"
                }`}
              >
                Todas las rutas ({data.routes.length})
              </button>
              {data.routes.map((route) => (
                <button
                  type="button"
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`rounded-xl px-3 py-2 text-left text-sm ring-1 ring-foreground/10 transition cursor-pointer relative group ${
                    selectedRouteId === route.id ? "bg-primary text-primary-contrast" : "bg-surface hover:bg-surface/80"
                  }`}
                >
                  <p className="font-semibold pr-6">{route.name}</p>
                  <p className="text-xs opacity-80">{route.code}</p>
                  {!route.isActive && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-warning" title="Inactiva" />
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="space-y-6">
            {/* ROUTE INFO CARD */}
            <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {selectedRoute?.imageUrl ? (
                      <img src={selectedRoute.imageUrl} alt={selectedRoute.name} className={`w-16 h-16 rounded-xl object-cover shadow-sm border border-slate-200 transition ${isUploading ? 'opacity-50' : 'group-hover:opacity-80'}`} />
                    ) : (
                      <div className={`w-16 h-16 rounded-xl bg-surface flex items-center justify-center border border-dashed border-slate-300 transition ${isUploading ? 'opacity-50' : 'group-hover:bg-slate-100'}`}>
                        <span className="text-xs text-muted text-center leading-tight px-1">Sin<br/>Foto</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded shadow-sm">Editar</span>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Vista Operativa</p>
                      {selectedRoute && !selectedRoute.isActive && (
                        <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold text-warning">INACTIVA</span>
                      )}
                    </div>
                    <h2 className="mt-1 text-xl font-semibold">{selectedRoute ? routeLabel(selectedRoute) : "Todas las rutas de Arequipa"}</h2>
                    {selectedRoute?.description && (
                      <p className="mt-1 text-sm text-muted">{selectedRoute.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center flex-wrap gap-2.5">
                  {selectedRoute && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenRouteModal("edit", selectedRoute)}
                        className="rounded-full bg-surface px-4 py-1.5 text-xs font-semibold text-foreground border border-foreground/10 hover:bg-surface/85 transition cursor-pointer"
                      >
                        Editar Datos
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRoute(selectedRoute.id)}
                        className="rounded-full bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/20 transition cursor-pointer"
                      >
                        Eliminar Ruta
                      </button>
                      <a href={`/routes/${selectedRoute.id}/map`} className="rounded-full bg-blue-100 px-4 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-200">
                        Editar Trayecto (Mapa)
                      </a>
                    </>
                  )}
                  <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-contrast">{visibleVehicles.length} buses</span>
                </div>
              </div>
            </article>

            {/* VEHICLES SECTION */}
            <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Bus className="w-5 h-5 text-muted" />
                  Unidades en Servicio
                </h3>
                <button
                  type="button"
                  onClick={() => handleOpenVehicleModal("create")}
                  className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-contrast hover:opacity-90 active:scale-95 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} /> Nueva Unidad
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {visibleVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="rounded-xl bg-surface p-4 ring-1 ring-foreground/10 flex flex-col justify-between hover:ring-foreground/20 transition duration-150">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                          <Bus className="w-4 h-4 text-muted" />
                          {vehicle.code}
                        </p>
                        <span className={`rounded-full px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider ${statusClasses[vehicle.status]}`}>
                          {vehicle.status}
                        </span>
                      </div>
                      <p className="mt-2.5 text-sm text-muted">
                        Placa: <span className="font-medium text-foreground">{vehicle.plateNumber ?? "Sin placa"}</span>
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        Capacidad: <span className="font-medium text-foreground">{vehicle.capacity ?? "-"}</span> pasajeros
                      </p>
                      {selectedRouteId === "all" && (
                        <p className="mt-3 text-2xs text-muted font-medium bg-foreground/5 px-2 py-1 rounded inline-flex items-center gap-1">
                          <Route className="w-3.5 h-3.5 text-muted" />
                          Ruta: {data.routes.find((r) => r.id === vehicle.routeId)?.name ?? "Sin asignar"}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-foreground/5 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenVehicleModal("edit", vehicle)}
                        className="rounded-lg bg-surface-strong p-1.5 text-muted hover:text-foreground ring-1 ring-foreground/10 hover:ring-foreground/20 active:scale-95 transition cursor-pointer"
                        title="Editar Unidad"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="rounded-lg bg-red-500/10 p-1.5 text-red-500 hover:bg-red-500/20 active:scale-95 transition cursor-pointer"
                        title="Eliminar Unidad"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {visibleVehicles.length === 0 && (
                <div className="mt-4 text-center py-8 bg-surface/50 rounded-xl border border-dashed border-foreground/10">
                  <p className="text-sm text-muted">No hay unidades en servicio en esta vista.</p>
                </div>
              )}
            </article>
          </div>
        </section>
      </section>

      {/* --- ROUTE MODAL --- */}
      {routeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-strong text-foreground border border-foreground/10 rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setRouteModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:bg-foreground/5 hover:text-foreground transition cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Route className="w-5 h-5 text-muted" />
              {routeModalMode === "create" ? "Nueva Ruta" : "Editar Datos de Ruta"}
            </h3>

            <form onSubmit={handleRouteSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wider text-muted uppercase">Código de Ruta</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: SIT-T2"
                  value={routeCode}
                  onChange={(e) => setRouteCode(e.target.value)}
                  className="w-full rounded-xl bg-surface px-3.5 py-2 text-sm border border-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wider text-muted uppercase">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Corredor Azul"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  className="w-full rounded-xl bg-surface px-3.5 py-2 text-sm border border-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wider text-muted uppercase">Descripción</label>
                <textarea
                  placeholder="Descripción opcional sobre la ruta"
                  value={routeDescription}
                  onChange={(e) => setRouteDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl bg-surface px-3.5 py-2 text-sm border border-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="flex items-center gap-2.5 py-2">
                <input
                  type="checkbox"
                  id="routeIsActive"
                  checked={routeIsActive}
                  onChange={(e) => setRouteIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary/20"
                />
                <label htmlFor="routeIsActive" className="text-sm font-medium text-foreground select-none cursor-pointer">
                  Ruta Activa (Habilitada para operaciones)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-foreground/10">
                <button
                  type="button"
                  onClick={() => setRouteModalOpen(false)}
                  className="rounded-xl bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface/80 active:scale-98 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createRouteMutation.isPending || updateRouteMutation.isPending}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-contrast hover:opacity-90 active:scale-98 transition disabled:opacity-50 cursor-pointer"
                >
                  {createRouteMutation.isPending || updateRouteMutation.isPending ? "Guardando..." : "Guardar Ruta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- VEHICLE MODAL --- */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-strong text-foreground border border-foreground/10 rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setVehicleModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:bg-foreground/5 hover:text-foreground transition cursor-pointer"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Bus className="w-5 h-5 text-muted" />
              {vehicleModalMode === "create" ? "Nueva Unidad de Servicio" : "Editar Unidad de Servicio"}
            </h3>

            <form onSubmit={handleVehicleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wider text-muted uppercase">Código del Vehículo / Bus</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: BUS-025"
                  value={vehicleCode}
                  onChange={(e) => setVehicleCode(e.target.value)}
                  className="w-full rounded-xl bg-surface px-3.5 py-2 text-sm border border-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wider text-muted uppercase">Número de Placa</label>
                <input
                  type="text"
                  placeholder="Ej: V9G-920"
                  value={vehiclePlateNumber}
                  onChange={(e) => setVehiclePlateNumber(e.target.value)}
                  className="w-full rounded-xl bg-surface px-3.5 py-2 text-sm border border-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold tracking-wider text-muted uppercase">Estado</label>
                  <select
                    value={vehicleStatus}
                    onChange={(e) => setVehicleStatus(e.target.value as VehicleStatus)}
                    className="w-full rounded-xl bg-surface px-3.5 py-2 text-sm border border-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                    <option value="MAINTENANCE">Mantenimiento</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold tracking-wider text-muted uppercase">Capacidad Pasajeros</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ej: 45"
                    value={vehicleCapacity}
                    onChange={(e) => setVehicleCapacity(e.target.value)}
                    className="w-full rounded-xl bg-surface px-3.5 py-2 text-sm border border-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold tracking-wider text-muted uppercase">Asignar a Ruta</label>
                <select
                  value={vehicleRouteId}
                  onChange={(e) => setVehicleRouteId(e.target.value)}
                  className="w-full rounded-xl bg-surface px-3.5 py-2 text-sm border border-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="none">Sin asignar / Libre</option>
                  {data.routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {routeLabel(route)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-foreground/10">
                <button
                  type="button"
                  onClick={() => setVehicleModalOpen(false)}
                  className="rounded-xl bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface/80 active:scale-98 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-contrast hover:opacity-90 active:scale-98 transition disabled:opacity-50 cursor-pointer"
                >
                  {createVehicleMutation.isPending || updateVehicleMutation.isPending ? "Guardando..." : "Guardar Unidad"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
