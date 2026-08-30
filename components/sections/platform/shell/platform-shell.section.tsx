import Link from "next/link";
import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/platform-auth/current-user";
import { platformRoutes } from "@/lib/platform-routes";
import { logoutAction } from "@/services/auth/auth.actions";
import { PlatformNav } from "./platform-nav.comp";
import "./platform-shell.section.css";

interface PlatformShellProps {
  children: ReactNode;
}

/**
 * Layout interno de la plataforma: sidebar de navegación + área de contenido.
 *
 * Lee la sesión sólo para mostrar quién ha entrado, nunca para proteger: si no
 * hay usuario se limita a no pintar el bloque. Quien corta el paso es el DAL
 * dentro de cada página (la doc de Next 16 desaconseja el check de auth en el
 * layout, que no controla el render de sus segmentos).
 */
export async function PlatformShell({ children }: PlatformShellProps) {
  const user = await getSessionUser();

  return (
    <div className="platform-shell">
      <aside className="platform-shell__sidebar">
        <Link href={platformRoutes.dashboard} className="platform-shell__logo">
          365 Días<span className="platform-shell__logo-accent"> de Ajedrez</span>
        </Link>

        <PlatformNav />

        <div className="platform-shell__footer">
          {user && (
            <>
              <div className="platform-shell__user">
                <span className="platform-shell__user-name">{user.displayName}</span>
                <span className="platform-shell__user-email">{user.email}</span>
              </div>

              <form action={logoutAction}>
                <button type="submit" className="platform-shell__logout">
                  Cerrar sesión
                </button>
              </form>
            </>
          )}

          <Link href="/" className="platform-shell__site-link">
            Ir al sitio público
          </Link>
        </div>
      </aside>

      <main className="platform-shell__content">{children}</main>
    </div>
  );
}
