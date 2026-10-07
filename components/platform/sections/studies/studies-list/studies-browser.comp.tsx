"use client";

import { useId, useState, type CSSProperties } from "react";
import { MagnifyingGlassIcon } from "@/components/icons/magnifying-glass-icon.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { DATABASE_KIND, type DatabaseKindCode } from "@/constants/platform/study-codes.const";
import { foldForSearch } from "@/lib/fold-for-search";
import type { StudyKindOption, StudySummary } from "@/services/studies/studies.types";
import { NewStudy } from "./new-study/new-study.comp";
import { StudyCard } from "./study-card.comp";
import "./studies-browser.comp.css";

/** Everything, their own by kind, or what they received. */
type Tab = "ALL" | "RECEIVED" | DatabaseKindCode;

/** Their own kinds, in the order the tabs take them, by the plural a tab says. */
const OWN_TABS: { code: DatabaseKindCode; label: string }[] = [
  { code: DATABASE_KIND.MY_GAMES, label: "Mis partidas" },
  { code: DATABASE_KIND.STUDY, label: "Estudios" },
  { code: DATABASE_KIND.TOURNAMENT, label: "Torneos" },
  { code: DATABASE_KIND.COLLECTION, label: "Colecciones" },
];

type Sort = "RECENT" | "NAME" | "GAMES";

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "RECENT", label: "Recientes" },
  { value: "NAME", label: "Nombre" },
  { value: "GAMES", label: "Más partidas" },
];

const COMPARE: Record<Sort, (left: StudySummary, right: StudySummary) => number> = {
  // ISO strings sort as the moments they write.
  RECENT: (left, right) => right.updatedAt.localeCompare(left.updatedAt),
  NAME: (left, right) => left.name.localeCompare(right.name, "es", { sensitivity: "base" }),
  GAMES: (left, right) => right.gameCount - left.gameCount || left.name.localeCompare(right.name, "es"),
};

/** The card's place in the entrance: the stylesheet turns it into its delay. */
type ItemStyle = CSSProperties & { "--studies-browser-index": number };

// Past a dozen cards the entrance would take a second: the rest come in together.
const itemStyle = (index: number): ItemStyle => ({ "--studies-browser-index": Math.min(index, 12) });

interface StudiesBrowserProps {
  /** Those that are theirs: "Mis partidas", their tournaments and their studies. */
  own: StudySummary[];
  /** What reaches them ready-made and cannot be touched: a teacher's collections, the games of their classes. */
  received: StudySummary[];
  /** The kinds they can create, for the grid's «Nuevo estudio» slot. */
  kinds: StudyKindOption[];
}

/**
 * The library of «Mis estudios» (2026-10-07, the «Biblioteca» direction): one
 * bar with the search, the tabs and the order; under it the grid of their own
 * studies, opened by the slot that creates one, and what they received in a
 * block of its own. Everything is filtered here, in the browser: the page
 * brings every study once, each with the folded text its search matches.
 */
export function StudiesBrowser({ own, received, kinds }: StudiesBrowserProps) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("ALL");
  const [sort, setSort] = useState<Sort>("RECENT");
  const receivedTitleId = useId();

  // The tabs come from what is there, not from a fixed list: a kind they have
  // none of has no tab, and the counts are the library's, whatever is searched.
  const tabs = [
    { code: "ALL" as Tab, label: "Todos", count: own.length + received.length },
    ...OWN_TABS.map(({ code, label }) => ({
      code: code as Tab,
      label,
      count: own.filter((s) => s.kindCode === code).length,
    })),
    { code: "RECEIVED" as Tab, label: "Recibidos", count: received.length },
  ].filter((entry) => entry.code === "ALL" || entry.count > 0);

  const wanted = foldForSearch(query);
  const matches = (study: StudySummary) => !wanted || study.searchText.includes(wanted);
  const ownShown = tab === "RECEIVED" ? [] : own.filter((s) => (tab === "ALL" || s.kindCode === tab) && matches(s));
  const receivedShown = tab === "ALL" || tab === "RECEIVED" ? received.filter(matches) : [];
  ownShown.sort(COMPARE[sort]);
  receivedShown.sort(COMPARE[sort]);
  const total = ownShown.length + receivedShown.length;

  // The slot that creates goes first in their own grid, while nothing is
  // searched and the tab is one a new study can belong to.
  const showSlot = !wanted && (tab === "ALL" || kinds.some((kind) => kind.code === tab));
  const slotOffset = showSlot ? 1 : 0;

  return (
    <div className="studies-browser">
      <div className="studies-browser__bar">
        <label className="studies-browser__search">
          <MagnifyingGlassIcon variant="classic-solid" className="studies-browser__search-icon" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o jugador"
            aria-label="Buscar estudios"
            className="studies-browser__search-input"
          />
        </label>

        <div className="studies-browser__tabs" role="group" aria-label="Tipo">
          {tabs.map((entry) => (
            <button
              key={entry.code}
              type="button"
              onClick={() => setTab(entry.code)}
              aria-pressed={entry.code === tab}
              className="studies-browser__tab"
            >
              {entry.label}
              <span className="studies-browser__tab-count">{entry.count}</span>
            </button>
          ))}
        </div>

        {/* In a box of its own: the select's own root is what the bar lays out. */}
        <div className="studies-browser__sort">
          <PlatformSelect
            aria-label="Ordenar"
            options={SORT_OPTIONS}
            value={sort}
            onValueChange={(value) => setSort(value as Sort)}
          />
        </div>
      </div>

      {/* What a search left, said out loud: the grid changes without a word. */}
      <p className="studies-browser__status" aria-live="polite">
        {wanted ? `${total} ${total === 1 ? "estudio" : "estudios"}` : ""}
      </p>

      {total === 0 && wanted && (
        <EmptyState
          title={`Nada coincide con «${query.trim()}»`}
          description="Busca por el nombre del estudio o por el de un jugador de sus partidas."
        />
      )}

      {/* The groups are keyed by the tab and the order, so changing either
          remounts them and the cards play their entrance again, one after
          another (`--studies-browser-index` sets each one's delay); typing
          does not. */}
      {(ownShown.length > 0 || showSlot) && (
        <section key={`own-${tab}-${sort}`} className="studies-browser__group" aria-label="Tus estudios">
          <div className="studies-browser__grid">
            {showSlot && (
              <div className="studies-browser__item" style={itemStyle(0)}>
                <NewStudy kinds={kinds} trigger="slot" />
              </div>
            )}
            {ownShown.map((study, index) => (
              <div key={study.id} className="studies-browser__item" style={itemStyle(slotOffset + index)}>
                <StudyCard study={study} />
              </div>
            ))}
          </div>
        </section>
      )}

      {receivedShown.length > 0 && (
        <section key={`received-${tab}-${sort}`} className="studies-browser__group" aria-labelledby={receivedTitleId}>
          <h2 id={receivedTitleId} className="studies-browser__group-title">
            Recibido <span className="studies-browser__group-count">{receivedShown.length}</span>
          </h2>
          <div className="studies-browser__grid">
            {receivedShown.map((study, index) => (
              <div
                key={study.id}
                className="studies-browser__item"
                // The received group follows their own, so its cards start after it.
                style={itemStyle(slotOffset + ownShown.length + index)}
              >
                <StudyCard study={study} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
