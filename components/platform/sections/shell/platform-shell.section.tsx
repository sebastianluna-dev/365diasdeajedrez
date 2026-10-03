import Link from "next/link";
import type { ReactNode } from "react";
import { LOGO_LABEL, LogoWordmarkIcon } from "@/components/icons/logo-wordmark-icon.comp";
import { buildPlatformNavGroups } from "@/constants/platform/nav-items.const";
import { getSessionUser } from "@/lib/platform-auth/current-user";
import { getSessionRoles } from "@/lib/platform-auth/roles";
import { homeRouteFor, teacherRoutes } from "@/lib/platform-routes";
import { ClearResultParams } from "./clear-result-params.comp";
import { PlatformNav } from "./platform-nav.comp";
import { PlatformSearch } from "./platform-search.comp";
import { PlatformUserMenu } from "./platform-user-menu.comp";
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
          {/* The same wordmark the public site draws, painted with the
              platform's tokens: the SVG is aria-hidden, so the link carries
              the brand's name. */}
          <Link href={homeHref} className="platform-shell__logo" aria-label={LOGO_LABEL}>
            <LogoWordmarkIcon
              className="platform-shell__logo-image"
              accentClassName="platform-shell__logo-accent"
              wordClassName="platform-shell__logo-word"
              marksClassName="platform-shell__logo-marks"
            />
          </Link>

          <PlatformNav groups={navGroups} />

          {/* At the right end, the two things that are not the menu: what is
              searched for, and who is signed in. */}
          <div className="platform-shell__tools">
            <PlatformSearch />

            {user && (
              <PlatformUserMenu
                displayName={user.displayName}
                initials={initialsOf(user.displayName)}
                // The teacher has a page of their own; nobody else does yet.
                profileHref={roles.isTeacher ? teacherRoutes.profile : undefined}
              />
            )}
          </div>
        </div>
      </header>

      <main id="contenido" className="platform-shell__content">
        {children}
      </main>

      {/* What an action said in the address (`?error=`, `?importadas=`) is
          said once: out of the address once the page has drawn it. */}
      <ClearResultParams />
    </div>
  );
}
