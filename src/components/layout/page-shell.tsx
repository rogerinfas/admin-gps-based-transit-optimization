import type { ReactNode } from "react";
import MainNavbar from "./main-navbar";

type PageShellProps = {
  children: ReactNode;
  navbarVariant?: "dark" | "light";
  mainClassName?: string;
};

export default function PageShell({
  children,
  navbarVariant = "light",
  mainClassName,
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNavbar variant={navbarVariant} />
      <main className={mainClassName ?? "mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 md:px-10"}>
        {children}
      </main>
    </div>
  );
}
