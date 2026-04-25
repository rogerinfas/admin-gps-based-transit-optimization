import ThemeToggle from "./components/theme-toggle";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-black text-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3 md:px-10">
          <div className="flex items-center gap-8">
            <span className="text-xl font-semibold tracking-tight">TransiGo</span>
            <nav className="hidden items-center gap-5 text-sm md:flex">
              <a href="#" className="text-white/85 transition hover:text-white">
                Viaje
              </a>
              <a href="#" className="text-white/85 transition hover:text-white">
                Rutas
              </a>
              <a href="#" className="text-white/85 transition hover:text-white">
                Monitoreo
              </a>
              <a href="#" className="text-white/85 transition hover:text-white">
                Reportes
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="text-sm text-white/90 transition hover:text-white">Ayuda</button>
            <button className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-white/90">
              Inicia sesion
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-10">
        <section className="grid items-start gap-8 lg:grid-cols-[1fr_430px]">
          <div className="max-w-lg">
            <p className="text-sm text-muted">Lima, PE</p>
            <h1 className="mt-2 text-5xl font-semibold leading-tight tracking-tight">
              Viaja por la ciudad con la app de TransiGo
            </h1>

            <div className="mt-6 inline-flex items-center rounded-full bg-surface-strong px-3 py-2 text-sm ring-1 ring-foreground/10">
              <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-contrast">
                Ahora
              </span>
              Pedir ruta en tiempo real
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-md bg-surface-strong px-4 py-3 ring-1 ring-foreground/10">
                <span className="text-sm text-muted">Punto de partida</span>
                <span className="text-xs">↗</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-surface-strong px-4 py-3 ring-1 ring-foreground/10">
                <span className="text-sm text-muted">Destino</span>
                <span className="text-xs">■</span>
              </div>
            </div>

            <button className="mt-4 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-contrast transition hover:opacity-90">
              Ver rutas sugeridas
            </button>

            <p className="mt-3 text-sm text-muted">Consulta estado de buses y ETA de llegada por corredor.</p>
          </div>

          <article className="rounded-2xl bg-surface-strong p-4 ring-1 ring-foreground/10">
            <div className="relative overflow-hidden rounded-xl">
              <Image
                src="/hero-transigo.webp"
                alt="Ilustracion de viaje para TransiGo"
                width={672}
                height={672}
                className="h-[300px] w-full object-cover"
                priority
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-surface px-3 py-1 text-sm ring-1 ring-foreground/10">Ruta R-12 activa</span>
              <span className="rounded-full bg-success/15 px-3 py-1 text-sm text-success">ETA promedio 4 min</span>
              <span className="rounded-full bg-warning/15 px-3 py-1 text-sm text-warning">2 alertas</span>
            </div>
          </article>
        </section>

        <section>
          <h2 className="mb-4 text-4xl font-semibold tracking-tight">Explora lo que puedes hacer con TransiGo</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="rounded-xl bg-surface-strong p-5 ring-1 ring-foreground/10">
              <p className="text-sm font-semibold">Viaje</p>
              <p className="mt-2 text-sm text-muted">
                Revisa buses disponibles cerca y selecciona el mejor corredor para tu trayecto.
              </p>
              <button className="mt-4 text-sm font-semibold underline">Detalles</button>
            </article>
            <article className="rounded-xl bg-surface-strong p-5 ring-1 ring-foreground/10">
              <p className="text-sm font-semibold">Reserva</p>
              <p className="mt-2 text-sm text-muted">
                Programa viajes frecuentes y activa recordatorios para evitar esperas largas.
              </p>
              <button className="mt-4 text-sm font-semibold underline">Detalles</button>
            </article>
            <article className="rounded-xl bg-surface-strong p-5 ring-1 ring-foreground/10">
              <p className="text-sm font-semibold">Alertas</p>
              <p className="mt-2 text-sm text-muted">
                Recibe incidencias de trafico y desvio de rutas en tiempo real desde operaciones.
              </p>
              <button className="mt-4 text-sm font-semibold underline">Detalles</button>
            </article>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Flota activa</p>
            <p className="mt-2 text-3xl font-semibold">18 buses</p>
            <p className="mt-2 text-sm text-muted">Operacion continua en 6 corredores urbanos.</p>
          </article>
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Puntualidad</p>
            <p className="mt-2 text-3xl font-semibold">95.2%</p>
            <p className="mt-2 text-sm text-muted">Cumplimiento de frecuencia por encima del objetivo.</p>
          </article>
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">Cobertura</p>
            <p className="mt-2 text-3xl font-semibold">42 paraderos</p>
            <p className="mt-2 text-sm text-muted">Seguimiento GPS y alertas en tiempo casi real.</p>
          </article>
        </section>
      </main>
    </div>
  );
}
