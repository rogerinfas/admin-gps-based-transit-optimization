"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./theme-toggle";
import { Button } from "@/components/ui/button";

type MainNavbarProps = {
  variant?: "dark" | "light";
};

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/operations", label: "Operaciones" },
  { href: "/simulation", label: "Monitoreo" },
];

export default function MainNavbar({ variant = "light" }: MainNavbarProps) {
  const pathname = usePathname();
  const isDark = variant === "dark";

  return (
    <header
      className={
        isDark ? "bg-black text-white" : "border-b border-border bg-background"
      }
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3 md:px-10">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tight">
            TransiGo
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className={
                    isDark
                      ? `transition ${isActive ? "text-white" : "text-white/70 hover:text-white hover:bg-white/10"}`
                      : `transition ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`
                  }
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            className={
              isDark ? "text-white/90 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-foreground"
            }
          >
            Ayuda
          </Button>
          <Button
            variant={isDark ? "secondary" : "default"}
            asChild
          >
            <Link href="/login">Inicia sesión</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
