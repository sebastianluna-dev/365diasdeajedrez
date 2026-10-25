import { GridIcon } from "@/components/icons/grid-icon.comp";
import { groupPlatformApps, type PlatformApps } from "@/constants/platform/nav-items.const";
import { ToolsFinder } from "./tools-finder.comp";
import "./tools-launcher.section.css";

/** How «Tus atajos» is counted in the strip: «las seis», «las cuatro». */
const SHORTCUT_WORDS = ["las", "las", "las dos", "las tres", "las cuatro", "las cinco", "las seis"];

interface ToolsLauncherSectionProps {
  /** The role's tools, the same the tools menu draws (`buildPlatformApps`). */
  apps: PlatformApps;
}

/**
 * «Herramientas» (`/herramientas`), in the new design system (2026-10-25, the
 * owner's «Herramientas A · Lanzador»): no side column, the white panel with
 * every tool of the role in rows by what it is for — the student's
 * «Practicar», «Aprender» and «Analizar»; the teacher's «Enseñar» first; the
 * staff's «Administrar» and «Banco de ejercicios» —, the search and the rows
 * in `ToolsFinder` (client: the query is its state), and at the foot a strip
 * that says what «Atajo» means. Data in: the menu's own list, so the page and
 * the menu never disagree.
 */
export function ToolsLauncherSection({ apps }: ToolsLauncherSectionProps) {
  const groups = groupPlatformApps(apps);
  const shortcuts = SHORTCUT_WORDS[apps.shortcuts.length] ?? "las";

  return (
    <div className="platform-workspace__panel tools-launcher">
      <ToolsFinder groups={groups} />
      {apps.shortcuts.length > 0 && (
        <aside className="tools-launcher__hint" aria-label="Tus atajos">
          <GridIcon className="tools-launcher__hint-icon" />
          <p className="tools-launcher__hint-text">
            Las marcadas como <strong>Atajo</strong> son {shortcuts} que ves primero al abrir el menú de cuadritos de la
            barra.
          </p>
        </aside>
      )}
    </div>
  );
}
