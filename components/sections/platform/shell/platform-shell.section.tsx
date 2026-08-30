import Link from "next/link";
import type { ReactNode } from "react";
import { platformRoutes } from "@/lib/platform-routes";
import { PlatformNav } from "./platform-nav.comp";
import "./platform-shell.section.css";

interface PlatformShellProps {
  children: ReactNode;
}

/** Layout interno de la plataforma: sidebar de navegación + área de contenido. */
export function PlatformShell({ children }: PlatformShellProps) {
  return (
    <div className="platform-shell">
      <aside className="platform-shell__sidebar">
        <Link href={platformRoutes.dashboard} className="platform-shell__logo">
          365 Días<span className="platform-shell__logo-accent"> de Ajedrez</span>
        </Link>

        <PlatformNav />

        <div className="platform-shell__footer">
          <Link href="/" className="platform-shell__site-link">
            Ir al sitio público
          </Link>
        </div>
      </aside>

      <main className="platform-shell__content">{children}</main>
    </div>
  );
}
