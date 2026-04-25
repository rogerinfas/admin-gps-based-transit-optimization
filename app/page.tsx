import Image from "next/image";
import ThemeToggle from "./components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-1 bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
        <header className="rounded-3xl bg-surface-strong p-6 shadow-sm ring-1 ring-foreground/10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-primary p-2.5">
                <Image src="/logo.png" alt="TransiGo logo" width={32} height={32} priority />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                  Fleet Control
                </p>
                <h1 className="text-2xl font-semibold tracking-tight">TransiGo Operations</h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-contrast transition hover:opacity-90">
                Iniciar monitoreo
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[380px_1fr]">
          <aside className="space-y-4">
            <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Estado actual
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">R-12 Norte</p>
              <div className="mt-4 inline-flex items-center rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success">
                En camino - ETA 4 min
              </div>
              <p className="mt-4 text-sm text-muted">
                Unidad B-24 operando con velocidad media de 34 km/h.
              </p>
            </article>

            <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                Alertas operativas
              </p>
              <div className="mt-3 flex items-start justify-between gap-4 rounded-xl bg-warning/15 p-3">
                <div>
                  <p className="text-sm font-semibold text-warning">Trafico alto</p>
                  <p className="text-sm text-muted">Demora estimada de 6 minutos en el tramo central.</p>
                </div>
                <span className="rounded-full bg-warning/20 px-2 py-1 text-xs font-semibold text-warning">
                  Alta
                </span>
              </div>
            </article>
          </aside>

          <article className="rounded-3xl bg-surface-strong p-5 ring-1 ring-foreground/10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Mapa en vivo</p>
                <h2 className="mt-1 text-xl font-semibold">Cobertura metropolitana</h2>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.12em] text-muted">Rendimiento</p>
                <p className="text-lg font-semibold text-route-line">95.2%</p>
              </div>
            </div>
            <div className="relative h-[360px] overflow-hidden rounded-2xl bg-[#121212] p-6 text-white">
              <div className="absolute inset-0 bg-size-[28px_28px] opacity-25 [background:radial-gradient(circle_at_20%_20%,#ffffff33_1px,transparent_1px)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                  Ruta activa: R-12 Norte
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-xs text-white/70">Buses activos</p>
                    <p className="mt-1 text-2xl font-semibold">18</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-xs text-white/70">Paradas</p>
                    <p className="mt-1 text-2xl font-semibold">42</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-3">
                    <p className="text-xs text-white/70">Incidentes</p>
                    <p className="mt-1 text-2xl font-semibold">2</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
