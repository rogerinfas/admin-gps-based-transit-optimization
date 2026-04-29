"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./theme-toggle";

type MainNavbarProps = {
  variant?: "dark" | "light";
};

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/operations", label: "Operaciones" },
];

export default function MainNavbar({ variant = "light" }: MainNavbarProps) {
  const pathname = usePathname();
  const isDark = variant === "dark";

  return (
    <header
      className={
        isDark ? "bg-black text-white" : "border-b border-foreground/10 bg-surface-strong"
      }
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3 md:px-10">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            TransiGo
          </Link>
          <nav className="hidden items-center gap-5 text-sm md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    isDark
                      ? `transition ${isActive ? "text-white" : "text-white/85 hover:text-white"}`
                      : `transition ${isActive ? "text-foreground" : "text-muted hover:text-foreground"}`
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            className={
              isDark ? "text-sm text-white/90 transition hover:text-white" : "text-sm text-muted transition hover:text-foreground"
            }
          >
            Ayuda
          </button>
          <button
            className={
              isDark
                ? "rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-white/90"
                : "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-contrast transition hover:opacity-90"
            }
          >
            Inicia sesion
          </button>
        </div>
      </div>
    </header>
  );
}
