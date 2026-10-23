"use client";

import type { ReactNode } from "react";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import { mdIconButton } from "@/lib/material/material-classes";
import { SETTINGS_PANEL_ID, setSettingsOpen } from "./settings-panel-state";
import "./platform-settings-panel.comp.css";

interface PlatformSettingsPanelProps {
  /** Its name, at the top: «Ajustes del curso». */
  title: string;
  /** Its groups (`PlatformSettingsGroup`), each with its options. */
  children: ReactNode;
}

/**
 * A page's settings, as Gmail's «Configuración rápida» (2026-10-23): a white
 * panel at the right of the workspace, beside the page's own panel, opened
 * and closed by the gear in the bar (`PlatformSettingsToggle`) and by its
 * own ✕. Closed it is not drawn (`display: none`, from the root's
 * `data-settings`), so a page carries it at no cost.
 *
 * A container: its title, its ✕ and what it is given (a Client Component
 * only for the ✕, which closes it and gives the focus back to the gear; what
 * it is given is drawn by the server). Each option is a row
 * the page draws with this block's elements — the control, its words and
 * the drawing at the right that shows what it does (`__option`, `__option-text`,
 * `__option-label`, `__option-hint`, `__option-art`) —, since what an
 * option is (a form, a link, a confirmation) is the page's.
 */
export function PlatformSettingsPanel({ title, children }: PlatformSettingsPanelProps) {
  return (
    <aside id={SETTINGS_PANEL_ID} className="platform-settings" aria-labelledby={`${SETTINGS_PANEL_ID}-title`}>
      <div className="platform-settings__head">
        <h2 id={`${SETTINGS_PANEL_ID}-title`} className="platform-settings__title">
          {title}
        </h2>
        <button
          type="button"
          className={mdIconButton("standard", "sm")}
          aria-label="Cerrar los ajustes"
          aria-controls={SETTINGS_PANEL_ID}
          onClick={() => {
            setSettingsOpen(false);
            document.querySelector<HTMLElement>(`[aria-controls="${SETTINGS_PANEL_ID}"][aria-pressed]`)?.focus();
          }}
        >
          <XmarkIcon variant="classic-solid" className="platform-md-icon" />
        </button>
      </div>
      <div className="platform-settings__body">{children}</div>
    </aside>
  );
}

interface PlatformSettingsGroupProps {
  /** The group's name: «Qué aprender», «Tu progreso». */
  title: string;
  /** Its options. */
  children: ReactNode;
}

/** A group of the panel: its name, and its options under it, set apart from the group above by a hairline. */
export function PlatformSettingsGroup({ title, children }: PlatformSettingsGroupProps) {
  return (
    <section className="platform-settings__group" aria-label={title}>
      <h3 className="platform-settings__group-title">{title}</h3>
      {children}
    </section>
  );
}
