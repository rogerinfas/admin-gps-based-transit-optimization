import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "./api";
import type { FetchErrorResponse } from "./common-errors";

export type FetchError = typeof Error & FetchErrorResponse;

/**
 * Devuelve la URL del backend para SSR y CSR. En cliente reemplaza
 * `localhost` por el host actual cuando se accede desde otra IP.
 */
export const getBackendUrl = (): string => {
  const envUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

  if (typeof window === "undefined") {
    return envUrl;
  }

  const currentHost = window.location.hostname;
  if (currentHost === "localhost" || currentHost === "127.0.0.1") {
    return envUrl;
  }

  try {
    const backendUrlObj = new URL(envUrl);
    if (
      backendUrlObj.hostname === "localhost" ||
      backendUrlObj.hostname === "127.0.0.1"
    ) {
      backendUrlObj.hostname = currentHost;
      return backendUrlObj.toString().replace(/\/$/, "");
    }
  } catch {
    // ignorado: caemos al envUrl
  }

  return envUrl;
};

export const BACKEND_URL = getBackendUrl();

export const enhancedFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  return fetch(input, {
    ...init,
    credentials: "include",
  });
};

const fetchClient = createFetchClient<paths>({
  baseUrl: BACKEND_URL,
  fetch: enhancedFetch,
});

export const backend = createClient(fetchClient);
