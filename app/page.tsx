import Image from "next/image";
import ThemeToggle from "./components/theme-toggle";

export default function Home() {
  return (
    <div className="flex flex-1 bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-8 md:px-10">
        <header className="rounded-2xl bg-surface-strong p-5 shadow-sm ring-1 ring-white/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="TransiGo logo" width={44} height={44} priority />
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                  GPS WEB APP
                </p>
                <h1 className="text-2xl font-semibold">TransiGo Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-contrast transition hover:brightness-110">
                Ver ruta en vivo
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-surface p-5 ring-1 ring-white/10">
            <p className="text-sm text-foreground/70">Estado del bus</p>
            <p className="mt-2 inline-flex rounded-full bg-(--success)/20 px-3 py-1 text-sm font-semibold text-success">
              En camino
            </p>
            <p className="mt-3 text-sm text-foreground/75">Llega en 4 minutos</p>
          </article>

          <article className="rounded-2xl bg-surface p-5 ring-1 ring-white/10">
            <p className="text-sm text-foreground/70">Ruta seleccionada</p>
            <p className="mt-2 text-2xl font-semibold text-route-line">R-12 Norte</p>
            <p className="mt-3 text-sm text-foreground/75">12 paradas activas</p>
          </article>

          <article className="rounded-2xl bg-surface p-5 ring-1 ring-(--warning)/40">
            <p className="text-sm text-foreground/70">Alertas</p>
            <p className="mt-2 inline-flex rounded-full bg-(--warning)/20 px-3 py-1 text-sm font-semibold text-warning">
              Tráfico alto
            </p>
            <p className="mt-3 text-sm text-foreground/75">
              Incremento estimado de 6 minutos.
            </p>
          </article>
        </section>

      </main>
    </div>
  );
}
