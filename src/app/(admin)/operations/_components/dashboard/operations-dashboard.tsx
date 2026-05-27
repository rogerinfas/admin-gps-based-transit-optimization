"use client";

import { useMemo, useState, useRef } from "react";
import type {
  OperationsDashboardData,
  RouteItem,
} from "../../_types/operations.types";
import { useUploadRouteImage } from "../../_hooks/use-upload-route-image";

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
  const [selectedRouteId, setSelectedRouteId] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutation } = useUploadRouteImage();
  const isUploading = mutation.isPending;

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
          // Refrescar datos del servidor tras la subida exitosa
          window.location.reload();
        },
        onSettled: () => {
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      },
    );
  };

  return (
    <>
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
          Arequipa - Centro de Operaciones
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          TransiGo Ops Panel
        </h1>
      </section>
      <section className="flex flex-col gap-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Rutas Totales</p><p className="mt-2 text-3xl font-semibold">{data.totals.routes}</p></article>
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Rutas Activas</p><p className="mt-2 text-3xl font-semibold">{data.totals.activeRoutes}</p></article>
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Flota Total</p><p className="mt-2 text-3xl font-semibold">{data.totals.vehicles}</p></article>
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Buses Activos</p><p className="mt-2 text-3xl font-semibold">{data.totals.activeVehicles}</p></article>
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">En Mantenimiento</p><p className="mt-2 text-3xl font-semibold">{data.totals.maintenanceVehicles}</p></article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <aside className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
            <h2 className="text-lg font-semibold">Corredores de Ruta</h2>
            <p className="mt-1 text-sm text-muted">Flujo estilo despacho Uber para monitoreo por corredor.</p>
            <div className="mt-4 flex flex-col gap-2">
              <button type="button" onClick={() => setSelectedRouteId("all")} className={`rounded-xl px-3 py-2 text-left text-sm ring-1 ring-foreground/10 transition ${selectedRouteId === "all" ? "bg-primary text-primary-contrast" : "bg-surface"}`}>Todas las rutas ({data.routes.length})</button>
              {data.routes.map((route) => (
                <button type="button" key={route.id} onClick={() => setSelectedRouteId(route.id)} className={`rounded-xl px-3 py-2 text-left text-sm ring-1 ring-foreground/10 transition ${selectedRouteId === route.id ? "bg-primary text-primary-contrast" : "bg-surface"}`}>
                  <p className="font-semibold">{route.name}</p>
                  <p className="text-xs opacity-80">{route.code}</p>
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-6">
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
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Vista Operativa</p>
                    <h2 className="mt-1 text-xl font-semibold">{selectedRoute ? routeLabel(selectedRoute) : "Todas las rutas de Arequipa"}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {selectedRoute && (
                    <a href={`/routes/${selectedRoute.id}/map`} className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 transition hover:bg-blue-200">
                      Editar Trayecto (Mapa)
                    </a>
                  )}
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-contrast">{visibleVehicles.length} buses visibles</span>
                </div>
              </div>
            </article>

            <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
              <h3 className="text-lg font-semibold">Unidades en servicio</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {visibleVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="rounded-xl bg-surface p-4 ring-1 ring-foreground/10">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{vehicle.code}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClasses[vehicle.status]}`}>{vehicle.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted">Placa: {vehicle.plateNumber ?? "Sin placa"}</p>
                    <p className="mt-1 text-sm text-muted">Capacidad: {vehicle.capacity ?? "-"} pasajeros</p>
                  </div>
                ))}
              </div>
              {visibleVehicles.length === 0 && <p className="mt-4 text-sm text-muted">No hay buses en esta ruta.</p>}
            </article>
          </div>
        </section>
      </section>
    </>
  );
}
