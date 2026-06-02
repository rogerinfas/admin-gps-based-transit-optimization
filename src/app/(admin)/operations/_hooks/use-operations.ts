"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BACKEND_URL,
  backendUrl,
  enhancedFetch,
} from "@/lib/api/types/backend";
import type { VehicleStatus } from "../_types/operations.types";

// --- RUTA MUTATIONS ---

export interface CreateRouteInput {
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export interface UpdateRouteInput {
  id: string;
  code?: string;
  name?: string;
  description?: string | null;
  isActive?: boolean;
}

export function useCreateRoute() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, CreateRouteInput>({
    mutationFn: async (data) => {
      const url = backendUrl(BACKEND_URL, "routes");
      const response = await enhancedFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.message ?? "Error al crear la ruta");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get"] });
      toast.success("Ruta creada con éxito");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateRoute() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, UpdateRouteInput>({
    mutationFn: async ({ id, ...data }) => {
      const url = backendUrl(BACKEND_URL, `routes/${id}`);
      const response = await enhancedFetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.message ?? "Error al actualizar la ruta");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get"] });
      toast.success("Ruta actualizada con éxito");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: async (id) => {
      const url = backendUrl(BACKEND_URL, `routes/${id}`);
      const response = await enhancedFetch(url, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.message ?? "Error al eliminar la ruta");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get"] });
      toast.success("Ruta eliminada con éxito");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// --- VEHICULO / UNIDAD DE SERVICIO MUTATIONS ---

export interface CreateVehicleInput {
  code: string;
  plateNumber: string | null;
  status: VehicleStatus;
  capacity: number | null;
  routeId: string | null;
}

export interface UpdateVehicleInput {
  id: string;
  code?: string;
  plateNumber?: string | null;
  status?: VehicleStatus;
  capacity?: number | null;
  routeId?: string | null;
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, CreateVehicleInput>({
    mutationFn: async (data) => {
      const url = backendUrl(BACKEND_URL, "vehicles");
      const response = await enhancedFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.message ?? "Error al crear la unidad");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get"] });
      toast.success("Unidad de servicio creada con éxito");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, UpdateVehicleInput>({
    mutationFn: async ({ id, ...data }) => {
      const url = backendUrl(BACKEND_URL, `vehicles/${id}`);
      const response = await enhancedFetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.message ?? "Error al actualizar la unidad");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get"] });
      toast.success("Unidad de servicio actualizada con éxito");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: async (id) => {
      const url = backendUrl(BACKEND_URL, `vehicles/${id}`);
      const response = await enhancedFetch(url, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.message ?? "Error al eliminar la unidad");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get"] });
      toast.success("Unidad de servicio eliminada con éxito");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
