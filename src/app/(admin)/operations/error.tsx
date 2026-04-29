"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground md:px-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-surface-strong p-6 ring-1 ring-foreground/10">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-warning">
          Error de integracion API
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          No se pudo cargar el panel de operaciones
        </h1>
        <p className="mt-3 text-sm text-muted">
          Verifica que el backend este activo y que `NEXT_PUBLIC_API_BASE_URL`
          apunte a la API correcta.
        </p>
        <p className="mt-2 text-xs text-muted">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-contrast"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
