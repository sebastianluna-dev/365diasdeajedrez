import Link from "next/link";
import type { ReactNode } from "react";
import { LOGO_LABEL, LogoWordmarkIcon } from "@/components/icons/logo-wordmark-icon.comp";
import { buildPlatformApps, needsStudentExerciseAccess } from "@/constants/platform/nav-items.const";
import { getSessionUser } from "@/lib/platform-auth/current-user";
import { getSessionRoles } from "@/lib/platform-auth/roles";
import { PLAY_ENABLED } from "@/constants/platform/features.const";
import { homeRouteFor, platformRoutes, teacherRoutes } from "@/lib/platform-routes";
import { getStudentExerciseAccess } from "@/services/exercises/exercises.service";
import { ClearResultParams } from "./clear-result-params.comp";
import { PlatformAppsMenu } from "./platform-apps-menu.comp";
import { PLATFORM_HEADER_CONTEXT_ID } from "./platform-header-context.comp";
import { PlatformPageName } from "./platform-page-name.comp";
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
 * The bar is Google's (2026-10-19): the wordmark and the page's name at the
 * left, what the page puts there in the middle (`PlatformHeaderContext`:
 * the calendar's «Hoy», arrows and view), and at the right the only two
 * things every page keeps — the tools menu, which is the whole navigation,
 * and the avatar.
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
  const apps = buildPlatformApps({ ...roles, hasExerciseSource });
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

          <PlatformPageName apps={apps} />

          {/* The page's own controls land here, through a portal; empty, it
              only pushes the tools to the right. */}
          <div id={PLATFORM_HEADER_CONTEXT_ID} className="platform-shell__context" />

          {/* At the right end, the two things every page keeps: the tools,
              and who is signed in. */}
          <div className="platform-shell__tools">
            <PlatformAppsMenu apps={apps} />

            {user && (
              <PlatformUserMenu
                displayName={user.displayName}
                initials={initialsOf(user.displayName)}
                // Everyone's profile while «Jugar» is on (the teacher's card is
                // «Mi ficha» in the menu); before it, only the teacher had a page.
                profileHref={
                  PLAY_ENABLED ? platformRoutes.profile : roles.isTeacher ? teacherRoutes.profile : undefined
                }
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
