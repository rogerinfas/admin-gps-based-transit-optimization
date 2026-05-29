import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Muestra solo el ícono sin el nombre */
  iconOnly?: boolean;
  /** Envuelve el logo en un Link hacia "/" */
  href?: string;
  /**
   * Fuerza el color del texto:
   * - "auto" (default): hereda del contexto (text-foreground)
   * - "light": texto blanco (para usar sobre fondos oscuros)
   * - "dark": texto negro (para usar sobre fondos claros)
   */
  textColor?: "auto" | "light" | "dark";
};

const textColorClass = {
  auto: "text-foreground",
  light: "text-white",
  dark: "text-[#141414]",
};

function LogoContent({
  className,
  iconOnly,
  textColor = "auto",
}: Pick<LogoProps, "className" | "iconOnly" | "textColor">) {
  return (
    <div className={cn("flex items-center gap-2.5 shrink-0", className)}>
      {/* Fondo SIEMPRE blanco para que el bus (gris) sea visible en cualquier tema */}
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white overflow-hidden shadow-sm border border-black/[0.06]">
        <Image
          src="/assets/logo.png"
          alt="TransiGo Logo"
          width={36}
          height={36}
          className="object-contain w-full h-full"
          priority
        />
      </div>
      {!iconOnly && (
        <span
          className={cn(
            "text-xl font-bold tracking-tight select-none",
            textColorClass[textColor]
          )}
        >
          TransiGo
        </span>
      )}
    </div>
  );
}

export default function Logo({
  className,
  iconOnly = false,
  href,
  textColor = "auto",
}: LogoProps) {
  if (href !== undefined) {
    return (
      <Link
        href={href}
        className="outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
      >
        <LogoContent className={className} iconOnly={iconOnly} textColor={textColor} />
      </Link>
    );
  }
  return <LogoContent className={className} iconOnly={iconOnly} textColor={textColor} />;
}
