import Logo from "./logo";
import Link from "next/link";

export default function MainFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-card/30 mt-auto">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 sm:flex-row md:px-10">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <Logo href="/" textColor="auto" />
          <span className="hidden sm:inline text-xs text-muted-foreground">|</span>
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            &copy; {currentYear} TransiGo. Desarrollado por Roger Infa Sanchez. Todos los derechos reservados.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <Link href="/help" className="hover:text-foreground transition-colors">
            Ayuda & Soporte
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors">
            Términos
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors">
            Privacidad
          </Link>
        </div>
      </div>
    </footer>
  );
}
