import Link from "next/link";
import type { ReactNode } from "react";
import { buildPlatformNavGroups } from "@/constants/platform/nav-items.const";
import { getSessionUser } from "@/lib/platform-auth/current-user";
import { getSessionRoles } from "@/lib/platform-auth/roles";
import { homeRouteFor } from "@/lib/platform-routes";
import { logoutAction } from "@/services/auth/auth.actions";
import { PlatformNav } from "./platform-nav.comp";
import "./platform-shell.section.css";

interface PlatformShellProps {
  children: ReactNode;
}

/**
 * Layout interno de la plataforma: sidebar de navegación + área de contenido.
 *
 * Lee la sesión sólo para mostrar quién ha entrado y qué menús le tocan, nunca
 * para proteger: si no hay usuario se limita a no pintar el bloque. Quien corta
 * el paso es el DAL dentro de cada página (la doc de Next 16 desaconseja el
 * check de auth en el layout, que no controla el render de sus segmentos), y
 * ocultar un grupo del menú no autoriza nada: cada página y cada action de
 * /teacher y /staff vuelve a comprobar el rol.
 */
export async function PlatformShell({ children }: PlatformShellProps) {
  const [user, roles] = await Promise.all([getSessionUser(), getSessionRoles()]);
  const navGroups = buildPlatformNavGroups(roles);
  // El logo lleva a la portada del rol, no al dashboard del alumno: con el menú
  // excluyente esa página ya no está en el menú de un profesor ni del staff.
  const homeHref = homeRouteFor(roles);

  return (
    <div className="platform-shell">
      <aside className="platform-shell__sidebar">
        <Link href={homeHref} className="platform-shell__logo">
          365 Días<span className="platform-shell__logo-accent"> de Ajedrez</span>
        </Link>

        <PlatformNav groups={navGroups} />

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
