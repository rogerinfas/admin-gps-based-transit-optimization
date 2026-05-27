"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BACKEND_URL,
  backendUrl,
  enhancedFetch,
} from "@/lib/api/types/backend";

interface UploadRouteImageInput {
  routeId: string;
  file: File;
}

interface UploadRouteImageResponse {
  id: string;
  imageUrl: string | null;
  [key: string]: unknown;
}

/**
 * Hook para subir/reemplazar la imagen de una ruta.
 * Usa FormData + enhancedFetch, igual que workwear.
 */
export function useUploadRouteImage() {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    UploadRouteImageResponse,
    Error,
    UploadRouteImageInput
  >({
    mutationFn: async ({ routeId, file }) => {
      const formData = new FormData();
      formData.append("file", file);

      const url = backendUrl(BACKEND_URL, `routes/${routeId}/image`);

      const response = await enhancedFetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMsg = "Error al subir la imagen";
        try {
          const errorBody = await response.json();
          errorMsg = errorBody?.message ?? errorMsg;
        } catch {
          // ignorado
        }
        throw new Error(errorMsg);
      }

      return response.json() as Promise<UploadRouteImageResponse>;
    },
    onSuccess: () => {
      // Invalidar queries de rutas para que se recargue la lista
      queryClient.invalidateQueries({ queryKey: ["get"] });
      toast.success("Imagen actualizada correctamente");
    },
    onError: (error) => {
      toast.error(error.message ?? "Error al subir la imagen");
    },
  });

  return { mutation };
}
