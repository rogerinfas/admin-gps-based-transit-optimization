import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Muestra solo el ícono sin el nombre */
  iconOnly?: boolean;
  /** Envuelve el logo en un Link hacia "/" */
  href?: string;
};

function LogoContent({ className, iconOnly }: Pick<LogoProps, "className" | "iconOnly">) {
  return (
    <div className={cn("flex items-center gap-2.5 shrink-0", className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground overflow-hidden p-0.5">
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
        <span className="text-xl font-bold tracking-tight text-foreground select-none">
          TransiGo
        </span>
      )}
    </div>
  );
}

export default function Logo({ className, iconOnly = false, href }: LogoProps) {
  if (href !== undefined) {
    return (
      <Link href={href} className="outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
        <LogoContent className={className} iconOnly={iconOnly} />
      </Link>
    );
  }
  return <LogoContent className={className} iconOnly={iconOnly} />;
}
