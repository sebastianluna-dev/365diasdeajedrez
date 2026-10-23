"use client";

import { GearIcon } from "@/components/icons/gear-icon.comp";
import { mdIconButton } from "@/lib/material/material-classes";
import {
  SETTINGS_PANEL_ID,
  setSettingsOpen,
  useSettingsOpen,
} from "@/components/platform/shared/platform-settings-panel/settings-panel-state";
import "./platform-settings-toggle.comp.css";

/**
 * The gear in the bar, as Gmail's (2026-10-23): opens and closes the page's
 * settings panel (`PlatformSettingsPanel`), lit while it is open. A page
 * with settings puts it in the bar through `PlatformHeaderContext`; it
 * sits at the right of the bar's middle, against the tools.
 */
export function PlatformSettingsToggle() {
  const open = useSettingsOpen();
  return (
    <button
      type="button"
      className={`${mdIconButton("standard", "sm")} platform-settings-toggle${open ? " platform-settings-toggle_state_on" : ""}`}
      aria-label={open ? "Cerrar los ajustes" : "Ajustes"}
      aria-pressed={open}
      aria-controls={SETTINGS_PANEL_ID}
      onClick={() => setSettingsOpen(!open)}
    >
      <GearIcon variant="classic-solid" className="platform-md-icon" />
    </button>
  );
}
