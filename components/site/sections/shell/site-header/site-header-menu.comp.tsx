"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { BarsIcon } from "@/components/icons/bars-icon.comp";
import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import { useLingering } from "@/components/chess/game-viewer/use-lingering.hook";
import { mdButton, mdIconButton } from "@/lib/material/material-classes";
import type { SiteNavLink } from "@/types/site-config.types";
import "./site-header-menu.comp.css";

interface SiteHeaderMenuProps {
  links: SiteNavLink[];
  loginLabel: string;
  loginHref: string;
  /** The main button's words; its link is already built (`ctaHref`), it opens WhatsApp. */
  cta: string;
  ctaHref: string;
}

/**
 * The header's menu below 1024 px: the toggle and, under the bar, the links,
 * «Iniciar sesión» and the main button. It enters in 160 ms and leaves in 120
 * (`useLingering` keeps it mounted while it goes); Escape closes it and gives
 * the focus back to the toggle, and following a link closes it.
 */
export function SiteHeaderMenu({ links, loginLabel, loginHref, cta, ctaHref }: SiteHeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const { value: shown, closing } = useLingering(open ? true : null);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- not a control: the block only hears Escape from the toggle and the links inside it, to close the menu
    <div
      className="site-header-menu"
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !open) return;
        close();
        toggleRef.current?.focus();
      }}
    >
      <button
        ref={toggleRef}
        type="button"
        className={`${mdIconButton("standard", "sm")} site-header-menu__toggle`}
        aria-label={open ? "Cerrar el menú" : "Abrir el menú"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? (
          <XmarkIcon variant="classic-solid" className="site-md-icon" />
        ) : (
          <BarsIcon variant="classic-solid" className="site-md-icon" />
        )}
      </button>
      <div
        id={panelId}
        className={`site-header-menu__panel${closing ? " site-header-menu__panel_state_closing" : ""}`}
        hidden={!shown}
      >
        <nav aria-label="Principal, en el menú">
          <ul className="site-header-menu__links">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="site-header-menu__link" onClick={close}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-header-menu__actions">
          <Link href={loginHref} className={mdButton("outlined", "md")} onClick={close}>
            {loginLabel}
          </Link>
          <a href={ctaHref} target="_blank" rel="noreferrer" className={mdButton("filled", "md")} onClick={close}>
            <CalendarIcon variant="classic-solid" className="site-md-icon" />
            {cta}
            <span className="site-sr-only"> (abre WhatsApp en una pestaña nueva)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
