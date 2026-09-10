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
 * Initials for the avatar: the first letter of the first two words.
 * "Alumno Demo" → "AD"; a single-word name gives a single letter.
 */
function initialsOf(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Internal layout of the platform: top bar + content area.
 *
 * It reads the session only to show who is logged in and which menus they
 * get, never to protect: if there is no user it simply does not render the
 * block. What blocks the way is the DAL inside each page (the Next 16 docs
 * advise against the auth check in the layout, which does not control the
 * render of its segments), and hiding a menu group authorises nothing:
 * every page and every action of /teacher and /staff checks the role again.
 */
export async function PlatformShell({ children }: PlatformShellProps) {
  const [user, roles] = await Promise.all([getSessionUser(), getSessionRoles()]);
  const navGroups = buildPlatformNavGroups(roles);
  // The logo leads to the role's home, not to the student dashboard: with
  // the exclusive menu that page is no longer in a teacher's or staff's menu.
  const homeHref = homeRouteFor(roles);

  return (
    <div className="platform-shell">
      <header className="platform-shell__bar">
        <div className="platform-shell__bar-inner">
          <Link href={homeHref} className="platform-shell__logo">
            365 Días<span className="platform-shell__logo-accent"> de Ajedrez</span>
          </Link>

          <PlatformNav groups={navGroups} />

          {user && (
            <div className="platform-shell__user">
              <div className="platform-shell__user-text">
                <span className="platform-shell__user-name">{user.displayName}</span>

                <span className="platform-shell__user-links">
                  <Link href="/" className="platform-shell__user-link">
                    Sitio público
                  </Link>
                  <span aria-hidden="true">·</span>
                  {/* The form goes in here so that "Salir" shares the line with the
                      link to the site: the bar only has two rows and losing the
                      logout is not an option. */}
                  <form action={logoutAction}>
                    <button type="submit" className="platform-shell__user-link">
                      Salir
                    </button>
                  </form>
                </span>
              </div>

              <span className="platform-shell__avatar" aria-hidden="true">
                {initialsOf(user.displayName)}
              </span>
            </div>
          )}
        </div>
      </header>

      <main id="contenido" className="platform-shell__content">
        {children}
      </main>
    </div>
  );
}
