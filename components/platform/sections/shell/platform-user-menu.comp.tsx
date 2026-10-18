"use client";

import Link from "next/link";
import { useState } from "react";
import { DropdownMenu } from "radix-ui";
import { ArrowUpIcon } from "@/components/icons/arrow-up-icon.comp";
import { ArrowRightFromBracketIcon } from "@/components/icons/arrow-right-from-bracket-icon.comp";
import { FireIcon } from "@/components/icons/fire-icon.comp";
import { SlidersIcon } from "@/components/icons/sliders-icon.comp";
import { MoonIcon } from "@/components/icons/moon-icon.comp";
import { UserIcon } from "@/components/icons/user-icon.comp";
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
  /** Their own page: their profile while «Jugar» is on; before it, the teacher's card. */
  profileHref?: string;
  /**
   * How the trigger is drawn: the avatar alone in the top bar (the default),
   * or a row with the avatar and the name at the foot of the side bar, whose
   * menu opens above it.
   */
  layout?: "avatar" | "row";
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
 * On Radix's `DropdownMenu` since 2026-10-09, like «Herramientas»: the
 * keyboard (the arrows, Home/End, typing a row's first letter), the focus,
 * Escape and a click outside come with the primitive. It was drawn by hand
 * while the platform had a `zoom`, under which Radix's placement landed the
 * menu 145px off the avatar; the zoom went on 2026-10-02.
 *
 * The theme and the way out are forms, so they work without JavaScript; their
 * rows keep the menu open on select (`preventDefault`), because closing it
 * would take the form out of the page before the browser submitted it.
 */
export function PlatformUserMenu({ displayName, initials, profileHref, layout = "avatar" }: PlatformUserMenuProps) {
  const [goal, setGoal] = useState<StudyGoal | null>(null);

  // Once per visit: the figures are read on the first opening and kept. A
  // failure leaves the block out and the menu whole — what one comes here for
  // is the way out, not the streak.
  const changeOpen = (open: boolean) => {
    if (open && !goal) void readStudyGoal().then(setGoal, () => {});
  };

  /** A row that submits its form: the menu stays open until the page answers. */
  const keepOpen = (event: Event) => event.preventDefault();

  return (
    <DropdownMenu.Root modal={false} onOpenChange={changeOpen}>
      {layout === "row" ? (
        <DropdownMenu.Trigger className="platform-user-menu__row" aria-label={`Tu cuenta: ${displayName}`}>
          <span className="platform-user-menu__avatar" aria-hidden="true">
            {initials}
          </span>
          <span className="platform-user-menu__row-text">
            <span className="platform-user-menu__row-name">{displayName}</span>
            <span className="platform-user-menu__row-note">Tu cuenta</span>
          </span>
        </DropdownMenu.Trigger>
      ) : (
        <DropdownMenu.Trigger className="platform-user-menu__avatar" aria-label={`Tu cuenta: ${displayName}`}>
          {initials}
        </DropdownMenu.Trigger>
      )}

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="platform-user-menu"
          side={layout === "row" ? "top" : "bottom"}
          align={layout === "row" ? "start" : "end"}
          sideOffset={10}
          collisionPadding={16}
          aria-label="Tu cuenta"
        >
          {goal && (
            <div className="platform-user-menu__day">
              <p className="platform-user-menu__figure">
                <span className="platform-user-menu__figure-mark">
                  <FireIcon
                    variant="duotone-solid"
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

          {goal && <DropdownMenu.Separator className="platform-user-menu__rule" />}

          {/* The name leads to their page when they have one; when they do
              not, it heads the menu and leads nowhere. */}
          {profileHref ? (
            <DropdownMenu.Item asChild>
              <Link href={profileHref} className="platform-user-menu__item">
                <UserIcon className="platform-user-menu__icon" />
                {displayName}
              </Link>
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Label className="platform-user-menu__item platform-user-menu__item_role_name">
              <UserIcon className="platform-user-menu__icon" />
              {displayName}
            </DropdownMenu.Label>
          )}

          <DropdownMenu.Item asChild>
            <Link href={platformRoutes.settings} className="platform-user-menu__item">
              <SlidersIcon className="platform-user-menu__icon" />
              Ajustes
            </Link>
          </DropdownMenu.Item>

          {/* The same row twice, and the stylesheet shows the one that fits the
              theme being drawn: which theme that IS cannot be known here when
              nobody has chosen — it is the machine's preference, and only the
              browser reads it. Each one asks for the other theme, and its
              switch is drawn in the state the current one is in. The hidden
              one cannot take the focus, and the primitive skips it. */}
          <form
            action={setTheme.bind(null, "dark")}
            className="platform-user-menu__theme platform-user-menu__theme_to_dark"
          >
            <CurrentPathField name="returnTo" />
            <DropdownMenu.Item asChild onSelect={keepOpen}>
              <button type="submit" className="platform-user-menu__item">
                <MoonIcon className="platform-user-menu__icon" />
                Modo oscuro
                <span className="platform-user-menu__switch" aria-hidden="true" />
              </button>
            </DropdownMenu.Item>
          </form>

          <form
            action={setTheme.bind(null, "light")}
            className="platform-user-menu__theme platform-user-menu__theme_to_light"
          >
            <CurrentPathField name="returnTo" />
            <DropdownMenu.Item asChild onSelect={keepOpen}>
              <button type="submit" className="platform-user-menu__item">
                <MoonIcon className="platform-user-menu__icon" />
                Modo oscuro
                <span className="platform-user-menu__switch platform-user-menu__switch_state_on" aria-hidden="true" />
              </button>
            </DropdownMenu.Item>
          </form>

          <DropdownMenu.Item asChild>
            <Link href="/" className="platform-user-menu__item">
              <ArrowUpIcon className="platform-user-menu__icon platform-user-menu__icon_turn_out" />
              Sitio público
            </Link>
          </DropdownMenu.Item>

          {/* A form, so signing out works without JavaScript, as it always has. */}
          <form action={logoutAction}>
            <DropdownMenu.Item asChild onSelect={keepOpen}>
              <button type="submit" className="platform-user-menu__item">
                <ArrowRightFromBracketIcon className="platform-user-menu__icon" />
                Cerrar sesión
              </button>
            </DropdownMenu.Item>
          </form>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
