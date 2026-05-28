"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./theme-toggle";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";

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
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isDark = variant === "dark";
  const { user, isAuthenticated, logout } = useAuth();

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
                      ? `transition ${isActive ? "text-white font-semibold" : "text-white/85 hover:text-white"}`
                      : `transition ${isActive ? "text-foreground font-semibold" : "text-muted hover:text-foreground"}`
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <button
            className={
              isDark ? "text-sm text-white/90 transition hover:text-white" : "text-sm text-muted transition hover:text-foreground"
            }
          >
            Ayuda
          </button>
          {isAuthenticated ? (
            <div className="flex items-center gap-3 ml-2">
              <div className={`flex items-center gap-2 text-sm font-medium ${isDark ? "text-white" : "text-foreground"}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isDark ? "bg-white/20" : "bg-primary/10"}`}>
                  <UserIcon size={16} />
                </div>
                <span className="hidden lg:inline-block">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className={`p-2 rounded-full transition-colors ${isDark ? "hover:bg-white/10 text-white/90 hover:text-white" : "hover:bg-foreground/5 text-muted hover:text-foreground"}`}
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className={
                isDark
                  ? "rounded-full bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-white/90"
                  : "rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-contrast transition hover:opacity-90"
              }
            >
              Inicia sesion
            </button>
          )}
        </div>

        {/* Mobile Toggle & Theme */}
        <div className="flex md:hidden items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 rounded-md transition-colors hover:bg-foreground/5"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className={`md:hidden border-t ${isDark ? 'border-white/10 bg-black' : 'border-foreground/10 bg-surface-strong'} px-6 py-4`}>
          <nav className="flex flex-col gap-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={
                    isDark
                      ? `text-sm transition ${isActive ? "text-white font-bold" : "text-white/85 hover:text-white"}`
                      : `text-sm transition ${isActive ? "text-foreground font-bold" : "text-muted hover:text-foreground"}`
                  }
                >
                  {item.label}
                </Link>
              );
            })}
            <hr className={isDark ? "border-white/10 my-2" : "border-foreground/10 my-2"} />
            <button
              className={`text-left text-sm ${isDark ? "text-white/90" : "text-muted"}`}
            >
              Ayuda
            </button>
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left text-sm font-medium flex items-center gap-2 ${isDark ? "text-red-400" : "text-red-600"}`}
              >
                <LogOut size={16} /> Cerrar sesión ({user?.name})
              </button>
            ) : (
              <button
                onClick={() => {
                  router.push("/login");
                  setIsMobileMenuOpen(false);
                }}
                className={
                  isDark
                    ? "w-full rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
                    : "w-full rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-contrast transition hover:opacity-90"
                }
              >
                Inicia sesion
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
