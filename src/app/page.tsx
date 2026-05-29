import Image from "next/image";
import Link from "next/link";
import PageShell from "@/components/layout/page-shell";

export default function Home() {
  return (
    <PageShell navbarVariant="dark">
        <section className="grid items-start gap-8 lg:grid-cols-[1fr_430px]">
          <div className="max-w-lg">
            <p className="text-sm text-muted-foreground">Arequipa, PE</p>
            <h1 className="mt-2 text-5xl font-semibold leading-tight tracking-tight">
              Viaja por la ciudad con la app de TransiGo
            </h1>

            <div className="mt-6 inline-flex items-center rounded-full bg-surface-strong px-3 py-2 text-sm ring-1 ring-foreground/10">
              <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                Ahora
              </span>
              Pedir ruta en tiempo real
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between rounded-md bg-surface-strong px-4 py-3 ring-1 ring-foreground/10">
                <span className="text-sm text-muted-foreground">Punto de partida</span>
                <span className="text-xs">↗</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-surface-strong px-4 py-3 ring-1 ring-foreground/10">
                <span className="text-sm text-muted-foreground">Destino</span>
                <span className="text-xs">■</span>
              </div>
            </div>

            <Link href="/operations" className="mt-4 inline-block rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
              Ir al panel de operaciones
            </Link>

            <p className="mt-3 text-sm text-muted-foreground">Consulta estado de buses y ETA de llegada por corredor en tiempo real.</p>
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
              <span className="rounded-full bg-surface px-3 py-1 text-sm ring-1 ring-foreground/10">Corredor T-1 activo</span>
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
              <p className="mt-2 text-sm text-muted-foreground">
                Revisa buses disponibles cerca y selecciona la mejor ruta del SIT Arequipa para tu trayecto.
              </p>
              <button className="mt-4 text-sm font-semibold underline">Detalles</button>
            </article>
            <article className="rounded-xl bg-surface-strong p-5 ring-1 ring-foreground/10">
              <p className="text-sm font-semibold">Reserva</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Programa viajes frecuentes en alimentadoras y troncales para evitar esperas largas.
              </p>
              <button className="mt-4 text-sm font-semibold underline">Detalles</button>
            </article>
            <article className="rounded-xl bg-surface-strong p-5 ring-1 ring-foreground/10">
              <p className="text-sm font-semibold">Alertas</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Recibe incidencias de tráfico, desvíos y obras en las vías de la Ciudad Blanca en tiempo real.
              </p>
              <button className="mt-4 text-sm font-semibold underline">Detalles</button>
            </article>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Flota activa</p>
            <p className="mt-2 text-3xl font-semibold">18 buses</p>
            <p className="mt-2 text-sm text-muted-foreground">Operación continua en 6 corredores del SIT Arequipa.</p>
          </article>
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Puntualidad</p>
            <p className="mt-2 text-3xl font-semibold">95.2%</p>
            <p className="mt-2 text-sm text-muted-foreground">Cumplimiento de frecuencia por encima de la meta del SIT.</p>
          </article>
          <article className="rounded-2xl bg-surface-strong p-5 ring-1 ring-foreground/10">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Cobertura</p>
            <p className="mt-2 text-3xl font-semibold">42 paraderos</p>
            <p className="mt-2 text-sm text-muted-foreground">Monitoreo GPS integrado y alertas en tiempo real.</p>
          </article>
        </section>
    </PageShell>
  );
}
