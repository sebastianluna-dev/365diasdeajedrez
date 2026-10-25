"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { CheckIcon } from "@/components/icons/check-icon.comp";
import { MagnifyingGlassIcon } from "@/components/icons/magnifying-glass-icon.comp";
import type { PlatformToolGroup } from "@/constants/platform/nav-items.const";
import { NavArt } from "@/components/platform/sections/shell/nav-art.comp";
import "./tools-finder.comp.css";

/** Lower case and without accents, so «analisis» finds «Tablero de análisis». */
const folded = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** «1 herramienta», «4 herramientas». */
const countOf = (count: number) => (count === 1 ? "1 herramienta" : `${count} herramientas`);

interface ToolsFinderProps {
  /** The role's tools by what they are for (`groupPlatformApps`), the shortcuts marked. */
  groups: PlatformToolGroup[];
}

/**
 * The page's title, its search and its rows of tools (2026-10-25, the
 * owner's «Herramientas A · Lanzador»): each row a column with what its
 * tools are for and how many there are, and the tiles — the tool's drawing
 * (`NavArt`, its tile's in the menu) on a grey well, its name, its line, and
 * «Atajo» on the ones of «Tus atajos». The whole tile is a link.
 *
 * The search is a filter, not a form: it narrows the tiles as one types, by
 * name or line, ignoring case and accents, never validates nor errs, and
 * leaves out a row with nothing left. Client, because the query is its
 * state; the title is drawn here only to sit beside the search.
 */
export function ToolsFinder({ groups }: ToolsFinderProps) {
  const [query, setQuery] = useState("");
  const baseId = useId();
  const needle = folded(query.trim());
  const shown = groups
    .map((group) => ({
      ...group,
      tools: needle
        ? group.tools.filter((tool) => folded(`${tool.label} ${tool.description}`).includes(needle))
        : group.tools,
    }))
    .filter((group) => group.tools.length > 0);

  return (
    <div className="tools-finder">
      <div className="tools-finder__top">
        <header className="tools-finder__head">
          <h1 className="tools-finder__title">Todas tus herramientas</h1>
          <p className="tools-finder__subtitle">Las mismas del botón de cuadritos, con lo que hace cada una.</p>
        </header>
        <div role="search" className="tools-finder__search">
          <MagnifyingGlassIcon variant="classic-solid" className="tools-finder__search-icon" />
          <input
            type="search"
            className="tools-finder__input"
            placeholder="Buscar una herramienta"
            aria-label="Buscar una herramienta"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {shown.length > 0 && (
        <nav className="tools-finder__groups" aria-label="Herramientas">
          {shown.map((group) => {
            const titleId = `${baseId}-${group.key}`;
            return (
              <section key={group.key} className="tools-finder__group" aria-labelledby={titleId}>
                <div className="tools-finder__what">
                  <h2 id={titleId} className="tools-finder__group-title">
                    {group.label}
                  </h2>
                  <p className="tools-finder__group-line">{group.description}</p>
                  <p className="tools-finder__count">{countOf(group.tools.length)}</p>
                </div>
                <ul className="tools-finder__tiles">
                  {group.tools.map((tool) => (
                    <li key={tool.href} className="tools-finder__item">
                      <Link href={tool.href} className="tools-finder__tile">
                        <span className="tools-finder__well">
                          <NavArt art={tool.art} className="tools-finder__art" />
                          {tool.isShortcut && (
                            <span className="tools-finder__pin">
                              <CheckIcon variant="classic-solid" className="tools-finder__pin-icon" />
                              Atajo
                            </span>
                          )}
                        </span>
                        <span className="tools-finder__name">{tool.label}</span>
                        <span className="tools-finder__line">{tool.description}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </nav>
      )}

      <p role="status" className="tools-finder__empty">
        {shown.length === 0 ? `Ninguna herramienta coincide con «${query.trim()}».` : ""}
      </p>
    </div>
  );
}
