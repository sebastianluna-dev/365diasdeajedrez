"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Popover } from "radix-ui";
import { useId, useState } from "react";
import { mdIconButton } from "@/lib/material/material-classes";
import { GridIcon } from "@/components/icons/grid-icon.comp";
import { activeApp, type PlatformApp, type PlatformApps } from "@/constants/platform/nav-items.const";
import { platformRoutes } from "@/lib/platform-routes";
import { NavArt } from "./nav-art.comp";
import "./platform-apps-menu.comp.css";

interface PlatformAppsMenuProps {
  /** The role's tools, composed in the shell (server): here they are only drawn. */
  apps: PlatformApps;
}

/**
 * The platform's tools menu (2026-10-19, the Google-style header): the button
 * of nine squares at the right of the bar, beside the avatar, and the panel it
 * opens — «Tus atajos», the role's first six tools, on a white card, and the
 * rest under it, each a tile with its drawing and its name, and at its foot
 * «Ver todas las herramientas», the page that shows them with what each one
 * does (`/herramientas`, 2026-10-25). It is the whole
 * navigation: the bar keeps for itself only the page's name and what the page
 * puts there (`PlatformHeaderContext`).
 *
 * On Radix's `Popover`: the focus moves into the panel, Escape and a click
 * outside close it, and a tile closes it as it leads away. The tile of the
 * page on screen is marked (`aria-current`).
 */
export function PlatformAppsMenu({ apps }: PlatformAppsMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const current = activeApp(apps, pathname);
  const titleId = useId();

  const tile = (app: PlatformApp) => {
    const isCurrent = app.href === current?.href;
    return (
      <li key={app.href}>
        <Link
          href={app.href}
          className={`platform-apps-menu__tile${isCurrent ? " platform-apps-menu__tile_state_current" : ""}`}
          aria-current={isCurrent ? "page" : undefined}
          onClick={() => setOpen(false)}
        >
          <NavArt art={app.art} className="platform-apps-menu__art" />
          <span className="platform-apps-menu__label">{app.label}</span>
        </Link>
      </li>
    );
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger className={mdIconButton("standard", "sm")} aria-label="Herramientas">
        <GridIcon variant="classic-solid" className="platform-md-icon" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="platform-apps-menu"
          align="end"
          sideOffset={8}
          collisionPadding={16}
          aria-label="Herramientas"
        >
          <nav className="platform-apps-menu__nav" aria-label="Herramientas">
            <section className="platform-apps-menu__shortcuts" aria-labelledby={titleId}>
              <h2 className="platform-apps-menu__title" id={titleId}>
                Tus atajos
              </h2>
              <ul className="platform-apps-menu__grid">{apps.shortcuts.map(tile)}</ul>
            </section>
            {apps.more.length > 0 && (
              <ul className="platform-apps-menu__grid platform-apps-menu__grid_place_more">{apps.more.map(tile)}</ul>
            )}
            <Link
              href={platformRoutes.tools}
              className="platform-apps-menu__all"
              aria-current={pathname === platformRoutes.tools ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              Ver todas las herramientas
            </Link>
          </nav>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
