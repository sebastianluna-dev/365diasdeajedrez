"use client";

import { useState } from "react";
import { BarsIcon } from "@/components/icons/bars-icon.comp";
import { mdIconButton } from "@/lib/material/material-classes";

/** Where the choice is written: the root, so the page's side column hears it wherever it is. */
const ATTRIBUTE = "data-side-nav";

/**
 * The three bars at the left of the bar, as Gmail's (Material's standard
 * icon button): they hide and show the
 * side column of a page of the new design system (`.platform-workspace__side`,
 * hidden by `:root[data-side-nav="hidden"]` in platform.css), so the panel
 * takes the whole width. Drawn on every page but shown only where there is a
 * column to hide (platform-shell.section.css). It is not kept: a new visit
 * shows the column.
 */
export function PlatformSideToggle() {
  const [hidden, setHidden] = useState(false);

  const toggle = () => {
    const next = !hidden;
    setHidden(next);
    if (next) document.documentElement.setAttribute(ATTRIBUTE, "hidden");
    else document.documentElement.removeAttribute(ATTRIBUTE);
  };

  return (
    <button
      type="button"
      className={`${mdIconButton("standard", "sm")} platform-side-toggle`}
      aria-label={hidden ? "Mostrar la barra lateral" : "Ocultar la barra lateral"}
      aria-pressed={hidden}
      onClick={toggle}
    >
      <BarsIcon variant="classic-solid" className="platform-md-icon" />
    </button>
  );
}
