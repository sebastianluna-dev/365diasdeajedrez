"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ArrowUpIcon } from "@/components/icons/arrow-up-icon.comp";
import { ArrowRightFromBracketIcon } from "@/components/icons/arrow-right-from-bracket-icon.comp";
import { FireIcon } from "@/components/icons/fire-icon.comp";
import { SlidersIcon } from "@/components/icons/sliders-icon.comp";
import { MoonIcon } from "@/components/icons/moon-icon.comp";
import { UserIcon } from "@/components/icons/user-icon.comp";
import { useLingering } from "@/components/chess/game-viewer/use-lingering.hook";
import { platformRoutes } from "@/lib/platform-routes";
import { CurrentPathField } from "@/components/platform/shared/current-path-field/current-path-field.comp";
import { setTheme } from "@/services/account/account.actions";
import { logoutAction } from "@/services/auth/auth.actions";
import { readStudyGoal } from "@/services/study-goal/study-goal.actions";
import type { StudyGoal } from "@/services/study-goal/study-goal.types";
import "./platform-user-menu.comp.css";

interface PlatformUserMenuProps {
  /** Whoever is signed in: the name the menu heads with. */
  displayName: string;
  /** The first letters of that name, which is what the avatar draws. */
  initials: string;
  /** Their own page, when their role has one (the teacher's profile). */
  profileHref?: string;
}

/** What the day has left, in words. */
function dayLabel(goal: StudyGoal): string {
  const left = goal.goalMinutes - goal.minutesToday;
  return left <= 0 ? "Objetivo del día cumplido" : `${left} min para tu objetivo de hoy`;
}

/**
 * Who is signed in, and everything that is theirs, behind the avatar of the
 * bar: the day's streak, their name and the way out.
 *
 * Client, because a menu opens. The shell resolves the session and hands it
 * the two strings it draws; the day's figures are NOT handed down — they are
 * asked for when the menu is opened (`readStudyGoal`), so they cost nothing
 * on the pages nobody opens it on and they are never stale.
 *
 * Drawn by hand and not on Radix, unlike the platform's other popups. Radix
 * moves what it opens with a `transform` in pixels, and here those pixels came
 * out multiplied by the platform's zoom: the menu landed 145px to the right of
 * the avatar, through the side of the window. The select's list, in the middle
 * of a page, is placed correctly by the same machinery — the difference was not
 * run down (see IMPROVEMENTS). Hung from the avatar with CSS there is nothing
 * to measure and nothing to go wrong.
 */
export function PlatformUserMenu({ displayName, initials, profileHref }: PlatformUserMenuProps) {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState<StudyGoal | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Kept mounted while it leaves, so the closing animation has something to
  // run on (see `useLingering`).
  const lingering = useLingering(open ? true : null);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  // Once per visit: the figures are read on the first opening and kept. A
  // failure leaves the block out and the menu whole — what one comes here for
  // is the way out, not the streak.
  const toggle = () => {
    setOpen((wasOpen) => !wasOpen);
    if (!goal) void readStudyGoal().then(setGoal, () => {});
  };

  // It closes like every other menu: clicking outside, or with Escape.
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  // A menu that opens takes the focus with it, like the viewer's: otherwise
  // whoever opened it with the keyboard is left on the avatar, with the rows
  // out of reach.
  useEffect(() => {
    if (!open) return;
    rootRef.current?.querySelector<HTMLElement>(".platform-user-menu a, .platform-user-menu button")?.focus();
  }, [open]);

  /** Up and down walk the rows and wrap around; the other keys are the page's. */
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("a, button"));
    if (items.length === 0) return;
    event.preventDefault();
    const current = items.findIndex((item) => item === document.activeElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    items[(current + step + items.length) % items.length]?.focus();
  };

  return (
    <div ref={rootRef} className="platform-user-menu-anchor">
      <button
        ref={buttonRef}
        type="button"
        className="platform-user-menu__avatar"
        aria-label={`Tu cuenta: ${displayName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
      >
        {initials}
      </button>

      {lingering.value && (
        // eslint-disable-next-line jsx-a11y/interactive-supports-focus -- the focus goes to the items inside it, never to the container
        <div
          role="menu"
          aria-label="Tu cuenta"
          className={`platform-user-menu${lingering.closing ? " platform-user-menu_state_closing" : ""}`}
          onKeyDown={handleKeyDown}
        >
          {goal && (
            <div className="platform-user-menu__day">
              <p className="platform-user-menu__figure">
                <span className="platform-user-menu__figure-mark">
                  <FireIcon
                    variant="solid"
                    className="platform-user-menu__flame"
                    coreClassName="platform-user-menu__flame-core"
                  />
                </span>
                <span className="platform-user-menu__figure-text">
                  <span className="platform-user-menu__figure-value">
                    {goal.streak.days} {goal.streak.days === 1 ? "día" : "días"}
                  </span>
                  <span className="platform-user-menu__figure-label">Racha de estudio</span>
                </span>
              </p>

              <span className="platform-user-menu__track">
                <span className="platform-user-menu__fill" style={{ width: `${goal.percent}%` }} />
              </span>

              <p className="platform-user-menu__day-note">
                <span>{dayLabel(goal)}</span>
                <span className="platform-user-menu__day-count">
                  {goal.minutesToday} / {goal.goalMinutes} min
                </span>
              </p>
            </div>
          )}

          {goal && <hr className="platform-user-menu__rule" />}

          {/* The name leads to their page when their role has one; when it
              does not, it heads the menu and leads nowhere. */}
          {profileHref ? (
            <Link href={profileHref} role="menuitem" className="platform-user-menu__item" onClick={() => close(false)}>
              <UserIcon className="platform-user-menu__icon" />
              {displayName}
            </Link>
          ) : (
            <p className="platform-user-menu__item platform-user-menu__item_role_name">
              <UserIcon className="platform-user-menu__icon" />
              {displayName}
            </p>
          )}

          <Link
            href={platformRoutes.settings}
            role="menuitem"
            className="platform-user-menu__item"
            onClick={() => close(false)}
          >
            <SlidersIcon className="platform-user-menu__icon" />
            Ajustes
          </Link>

          {/* The same row twice, and the stylesheet shows the one that fits the
              theme being drawn: which theme that IS cannot be known here when
              nobody has chosen — it is the machine's preference, and only the
              browser reads it. Each one asks for the other theme, and its
              switch is drawn in the state the current one is in. */}
          <form
            action={setTheme.bind(null, "dark")}
            className="platform-user-menu__theme platform-user-menu__theme_to_dark"
          >
            <CurrentPathField name="returnTo" />
            <button type="submit" role="menuitem" className="platform-user-menu__item">
              <MoonIcon className="platform-user-menu__icon" />
              Modo oscuro
              <span className="platform-user-menu__switch" aria-hidden="true" />
            </button>
          </form>

          <form
            action={setTheme.bind(null, "light")}
            className="platform-user-menu__theme platform-user-menu__theme_to_light"
          >
            <CurrentPathField name="returnTo" />
            <button type="submit" role="menuitem" className="platform-user-menu__item">
              <MoonIcon className="platform-user-menu__icon" />
              Modo oscuro
              <span className="platform-user-menu__switch platform-user-menu__switch_state_on" aria-hidden="true" />
            </button>
          </form>

          <Link href="/" role="menuitem" className="platform-user-menu__item" onClick={() => close(false)}>
            <ArrowUpIcon className="platform-user-menu__icon platform-user-menu__icon_turn_out" />
            Sitio público
          </Link>

          {/* A form, so signing out works without JavaScript, as it always has. */}
          <form action={logoutAction}>
            <button type="submit" role="menuitem" className="platform-user-menu__item">
              <ArrowRightFromBracketIcon className="platform-user-menu__icon" />
              Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
