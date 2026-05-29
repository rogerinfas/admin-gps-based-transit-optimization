"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./theme-toggle";
import Logo from "./logo";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth-provider";
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
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isDark = variant === "dark";
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header
      className={
        isDark ? "bg-black text-white" : "border-b border-border bg-background"
      }
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3 md:px-10">
        <div className="flex items-center gap-8">
          <Logo href="/" textColor={isDark ? "light" : "auto"} />
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  render={<Link href={item.href} />}
                  nativeButton={false}
                  className={
                    isDark
                      ? `transition ${isActive ? "text-white font-semibold" : "text-white/70 hover:text-white hover:bg-white/10"}`
                      : `transition ${isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`
                  }
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            className={
              isDark ? "text-white/90 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-foreground"
            }
          >
            Ayuda
          </Button>
          {isAuthenticated ? (
            <div className="flex items-center gap-2 ml-2">
              <div className={`flex items-center gap-2 text-sm font-medium ${isDark ? "text-white" : "text-foreground"}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isDark ? "bg-white/20" : "bg-primary/10"}`}>
                  <UserIcon size={16} />
                </div>
                <span className="hidden lg:inline-block">{user?.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className={isDark ? "hover:bg-white/10 text-white/90 hover:text-white" : "hover:bg-accent text-muted-foreground hover:text-foreground"}
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </Button>
            </div>
          ) : (
            <Button
              variant={isDark ? "secondary" : "default"}
              onClick={() => router.push("/login")}
            >
              Inicia sesión
            </Button>
          )}
        </div>

        {/* Mobile Toggle & Theme */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className={`md:hidden border-t ${isDark ? 'border-white/10 bg-black' : 'border-border bg-background'} px-6 py-4`}>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  render={<Link href={item.href} />}
                  nativeButton={false}
                  className="justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Button>
              );
            })}
            <hr className={isDark ? "border-white/10 my-2" : "border-border my-2"} />
            <Button
              variant="ghost"
              className="justify-start"
            >
              Ayuda
            </Button>
            {isAuthenticated ? (
              <Button
                variant="ghost"
                className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut size={16} className="mr-2" /> Cerrar sesión ({user?.name})
              </Button>
            ) : (
              <Button
                variant={isDark ? "secondary" : "default"}
                className="w-full mt-2"
                onClick={() => {
                  router.push("/login");
                  setIsMobileMenuOpen(false);
                }}
              >
                Inicia sesión
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
