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
import { Plus, Pencil, Trash2, X, Bus, Route, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

type Props = {
  data: OperationsDashboardData;
};

const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  MAINTENANCE: "destructive",
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
  const [vehicleRouteId, setVehicleRouteId] = useState<string>("none");

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
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Arequipa - Centro de Operaciones
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            TransiGo Ops Panel
          </h1>
        </div>
      </section>

      <section className="mt-8 flex flex-col gap-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Rutas Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.totals.routes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Rutas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.totals.activeRoutes}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Flota Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.totals.vehicles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Buses Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{data.totals.activeVehicles}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">En Mantenimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{data.totals.maintenanceVehicles}</div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* SIDEBAR: RUTAS */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Route className="w-5 h-5 text-muted-foreground" />
                  Corredores de Ruta
                </CardTitle>
                <Button size="sm" onClick={() => handleOpenRouteModal("create")} className="h-8 gap-1">
                  <Plus className="h-4 w-4" /> Nueva
                </Button>
              </div>
              <CardDescription>Flujo estilo despacho para monitoreo por corredor.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button
                variant={selectedRouteId === "all" ? "default" : "outline"}
                className="justify-start w-full text-left"
                onClick={() => setSelectedRouteId("all")}
              >
                Todas las rutas ({data.routes.length})
              </Button>
              {data.routes.map((route) => (
                <Button
                  key={route.id}
                  variant={selectedRouteId === route.id ? "default" : "outline"}
                  className="justify-between w-full h-auto py-3 px-4 relative group"
                  onClick={() => setSelectedRouteId(route.id)}
                >
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold">{route.name}</span>
                    <span className="text-xs opacity-70 font-mono">{route.code}</span>
                  </div>
                  {!route.isActive && (
                    <Badge variant="destructive" className="ml-2 px-1 py-0 h-4 w-4 rounded-full flex justify-center items-center p-0" title="Inactiva" />
                  )}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* MAIN CONTENT AREA */}
          <div className="space-y-6">
            {/* ROUTE INFO CARD */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                      {selectedRoute?.imageUrl ? (
                        <img src={selectedRoute.imageUrl} alt={selectedRoute.name} className={`w-20 h-20 rounded-xl object-cover shadow-sm border border-slate-200 transition ${isUploading ? 'opacity-50' : 'group-hover:opacity-80'}`} />
                      ) : (
                        <div className={`w-20 h-20 rounded-xl bg-muted flex items-center justify-center border border-dashed border-slate-300 transition ${isUploading ? 'opacity-50' : 'group-hover:bg-slate-200'}`}>
                          <span className="text-xs text-muted-foreground text-center leading-tight">Subir<br/>Foto</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded shadow-sm">Editar</span>
                      </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px] tracking-wider uppercase">Vista Operativa</Badge>
                        {selectedRoute && !selectedRoute.isActive && (
                          <Badge variant="destructive" className="text-[10px]">INACTIVA</Badge>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight">{selectedRoute ? routeLabel(selectedRoute) : "Todas las rutas de Arequipa"}</h2>
                      {selectedRoute?.description && (
                        <p className="mt-1 text-sm text-muted-foreground">{selectedRoute.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-2">
                    {selectedRoute && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleOpenRouteModal("edit", selectedRoute)}>
                          <Pencil className="h-4 w-4 mr-2" /> Editar Datos
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteRoute(selectedRoute.id)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Eliminar Ruta
                        </Button>
                        <Button variant="secondary" size="sm" render={<Link href={`/routes/${selectedRoute.id}/map`} />} nativeButton={false}>
                          <MapPin className="h-4 w-4 mr-2" /> Editar Trayecto
                        </Button>
                      </>
                    )}
                    <Badge variant="default" className="h-8 px-3">{visibleVehicles.length} buses</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* VEHICLES SECTION */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bus className="w-5 h-5 text-muted-foreground" />
                  Unidades en Servicio
                </CardTitle>
                <Button size="sm" onClick={() => handleOpenVehicleModal("create")} className="gap-1">
                  <Plus className="h-4 w-4" /> Nueva Unidad
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  {visibleVehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="bg-muted/30 hover:bg-muted/50 transition">
                      <CardContent className="p-4 flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <h4 className="font-bold flex items-center gap-1.5 text-lg">
                              <Bus className="w-4 h-4 text-muted-foreground" />
                              {vehicle.code}
                            </h4>
                            <Badge variant={statusMap[vehicle.status] || "default"}>
                              {vehicle.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>Placa: <span className="font-medium text-foreground">{vehicle.plateNumber ?? "Sin placa"}</span></p>
                            <p>Capacidad: <span className="font-medium text-foreground">{vehicle.capacity ?? "-"}</span> pasajeros</p>
                            {selectedRouteId === "all" && (
                              <p className="mt-2 text-xs font-medium bg-background px-2 py-1 rounded inline-flex items-center gap-1 border">
                                <Route className="w-3 h-3" />
                                Ruta: {data.routes.find((r) => r.id === vehicle.routeId)?.name ?? "Sin asignar"}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => handleOpenVehicleModal("edit", vehicle)} title="Editar Unidad">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteVehicle(vehicle.id)} title="Eliminar Unidad">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {visibleVehicles.length === 0 && (
                  <div className="mt-8 text-center py-12 border-2 border-dashed rounded-xl">
                    <p className="text-muted-foreground font-medium">No hay unidades en servicio en esta vista.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </section>

      {/* --- ROUTE MODAL --- */}
      <Dialog open={routeModalOpen} onOpenChange={setRouteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Route className="w-5 h-5 text-muted-foreground" />
              {routeModalMode === "create" ? "Nueva Ruta" : "Editar Datos de Ruta"}
            </DialogTitle>
            <DialogDescription>
              {routeModalMode === "create" ? "Agrega una nueva ruta operativa al sistema." : "Modifica los detalles de esta ruta."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRouteSubmit} className="space-y-5 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Código de Ruta</label>
              <Input
                required
                placeholder="Ej: SIT-T2"
                value={routeCode}
                onChange={(e) => setRouteCode(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Nombre</label>
              <Input
                required
                placeholder="Ej: Corredor Azul"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Descripción</label>
              <Textarea
                placeholder="Descripción opcional sobre la ruta"
                value={routeDescription}
                onChange={(e) => setRouteDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex items-center space-x-2 bg-muted/50 p-3 rounded-lg border border-border">
              <Checkbox
                id="routeIsActive"
                checked={routeIsActive}
                onCheckedChange={(checked) => setRouteIsActive(checked as boolean)}
              />
              <label
                htmlFor="routeIsActive"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ruta Activa (Habilitada para operaciones)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button type="button" variant="outline" onClick={() => setRouteModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createRouteMutation.isPending || updateRouteMutation.isPending}>
                {createRouteMutation.isPending || updateRouteMutation.isPending ? "Guardando..." : "Guardar Ruta"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- VEHICLE MODAL --- */}
      <Dialog open={vehicleModalOpen} onOpenChange={setVehicleModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bus className="w-5 h-5 text-muted-foreground" />
              {vehicleModalMode === "create" ? "Nueva Unidad de Servicio" : "Editar Unidad de Servicio"}
            </DialogTitle>
            <DialogDescription>
              {vehicleModalMode === "create" ? "Registra un nuevo bus para que preste servicio en las rutas." : "Modifica los datos del vehículo."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVehicleSubmit} className="space-y-5 pt-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Código del Vehículo / Bus</label>
              <Input
                required
                placeholder="Ej: BUS-025"
                value={vehicleCode}
                onChange={(e) => setVehicleCode(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Número de Placa</label>
              <Input
                placeholder="Ej: V9G-920"
                value={vehiclePlateNumber}
                onChange={(e) => setVehiclePlateNumber(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Estado</label>
                <Select value={vehicleStatus} onValueChange={(val) => setVehicleStatus(val as VehicleStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Activo</SelectItem>
                    <SelectItem value="INACTIVE">Inactivo</SelectItem>
                    <SelectItem value="MAINTENANCE">Mantenimiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Capacidad Pasajeros</label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Ej: 45"
                  value={vehicleCapacity}
                  onChange={(e) => setVehicleCapacity(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Asignar a Ruta</label>
              <Select value={vehicleRouteId} onValueChange={(val) => setVehicleRouteId(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar ruta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar / Libre</SelectItem>
                  {data.routes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {routeLabel(route)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
              <Button type="button" variant="outline" onClick={() => setVehicleModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createVehicleMutation.isPending || updateVehicleMutation.isPending}>
                {createVehicleMutation.isPending || updateVehicleMutation.isPending ? "Guardando..." : "Guardar Unidad"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
