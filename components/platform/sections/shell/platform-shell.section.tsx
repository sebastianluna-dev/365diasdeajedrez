import Link from "next/link";
import type { ReactNode } from "react";
import { LOGO_LABEL, LogoWordmarkIcon } from "@/components/icons/logo-wordmark-icon.comp";
import { buildPlatformNavGroups, needsStudentExerciseAccess } from "@/constants/platform/nav-items.const";
import { getSessionUser } from "@/lib/platform-auth/current-user";
import { getSessionRoles } from "@/lib/platform-auth/roles";
import { PLAY_ENABLED } from "@/constants/platform/features.const";
import { homeRouteFor, platformRoutes, teacherRoutes } from "@/lib/platform-routes";
import { getStudentExerciseAccess } from "@/services/exercises/exercises.service";
import { ClearResultParams } from "./clear-result-params.comp";
import { PlatformNav } from "./platform-nav.comp";
import { PlatformSearch } from "./platform-search.comp";
import { PlatformSideNav } from "./platform-side-nav.comp";
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
 * Internal layout of the platform: the menu and the content area. The menu
 * is the side bar from 1024px (2026-10-18) and the bar across the top below
 * that; both are in the markup and the stylesheet shows the one that fits.
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
  // «Ejercicios» is a student's only once they have something there (an
  // active teacher, a series given): the database is asked only then.
  const hasExerciseSource = user && needsStudentExerciseAccess(roles) ? await getStudentExerciseAccess() : false;
  const navGroups = buildPlatformNavGroups({ ...roles, hasExerciseSource });
  // The logo leads to the role's home, not to the student dashboard: with
  // the exclusive menu that page is no longer in a teacher's or staff's menu.
  const homeHref = homeRouteFor(roles);
  // Everyone's profile while «Jugar» is on (the teacher's card is «Mi ficha»
  // in the menu); before it, only the teacher had a page.
  const profileHref = PLAY_ENABLED ? platformRoutes.profile : roles.isTeacher ? teacherRoutes.profile : undefined;
  const logo = (
    <LogoWordmarkIcon
      className="platform-shell__logo-image"
      accentClassName="platform-shell__logo-accent"
      wordClassName="platform-shell__logo-word"
      marksClassName="platform-shell__logo-marks"
    />
  );

  return (
    <div className="platform-shell">
      {/* From 1024px: the logo, the search, the menu and, at the foot, who is signed in. */}
      <aside className="platform-shell__side" aria-label="Menú">
        <Link href={homeHref} className="platform-shell__logo" aria-label={LOGO_LABEL}>
          {logo}
        </Link>
        <PlatformSearch width="full" />
        <PlatformSideNav groups={navGroups} />
        {user && (
          <div className="platform-shell__side-foot">
            <PlatformUserMenu
              displayName={user.displayName}
              initials={initialsOf(user.displayName)}
              profileHref={profileHref}
              layout="row"
            />
          </div>
        )}
      </aside>

      <header className="platform-shell__bar">
        <div className="platform-shell__bar-inner">
          {/* The same wordmark the public site draws, painted with the
              platform's tokens: the SVG is aria-hidden, so the link carries
              the brand's name. */}
          <Link href={homeHref} className="platform-shell__logo" aria-label={LOGO_LABEL}>
            {logo}
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
                profileHref={profileHref}
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
