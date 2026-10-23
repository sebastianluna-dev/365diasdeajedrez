"use client";

import { useId, useState, type CSSProperties } from "react";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { PlatformHeaderContext } from "@/components/platform/sections/shell/platform-header-context.comp";
import { foldForSearch } from "@/lib/fold-for-search";
import type { StudyResume, StudySummary } from "@/services/studies/studies.types";
import { StudiesSearch } from "../studies-search/studies-search.comp";
import { ResumeStudy } from "./resume-study.comp";
import { StudyCard } from "./study-card.comp";
import "./studies-browser.comp.css";

/** The card's place in the entrance: the stylesheet turns it into its delay. */
type ItemStyle = CSSProperties & { "--studies-browser-index": number };

// Past a dozen cards the entrance would take a second: the rest come in together.
const itemStyle = (index: number): ItemStyle => ({ "--studies-browser-index": Math.min(index, 12) });

interface StudiesBrowserProps {
  /** Their own studies the view shows, in its order. */
  own: StudySummary[];
  /** What reached them ready-made that the view shows, in its order. */
  received: StudySummary[];
  /** «Sigue donde ibas», on the view of every study; absent on the others, or when nothing was opened. */
  resume?: StudySummary & { resume: StudyResume };
  /** What the address asked to search (`?q=`, a search sent from a study's bar). */
  initialQuery?: string;
  /** The view's name, for what it says when it has nothing: «Torneos». */
  viewLabel: string;
  /**
   * Which view and order are on screen: a new one remounts the groups, and
   * the cards play their entrance again.
   */
  viewKey: string;
}

/**
 * The library of «Mis estudios», in the new design system (2026-10-23, «M4»
 * of the owner's canvas): the panel of the workspace. «Sigue donde ibas» at
 * its head, then «Tus estudios» and «Recibido» in grids of outlined cards.
 * Which kinds and in what order is the address's, chosen in the side column
 * and applied on the server; the search lives in the bar
 * (`PlatformHeaderContext`) and filters here, as one types: every study came
 * with the folded text it is searched by.
 */
export function StudiesBrowser({ own, received, resume, initialQuery = "", viewLabel, viewKey }: StudiesBrowserProps) {
  const [query, setQuery] = useState(initialQuery);
  const ownTitleId = useId();
  const receivedTitleId = useId();

  const wanted = foldForSearch(query);
  const matches = (study: StudySummary) => !wanted || study.searchText.includes(wanted);
  const ownShown = own.filter(matches);
  const receivedShown = received.filter(matches);
  const total = ownShown.length + receivedShown.length;

  return (
    <div className="studies-browser">
      <PlatformHeaderContext inlineClassName="studies-browser__search">
        <StudiesSearch value={query} onChange={setQuery} />
      </PlatformHeaderContext>

      {/* What a search left, said out loud: the grid changes without a word. */}
      <p className="studies-browser__status" aria-live="polite">
        {wanted ? `${total} ${total === 1 ? "estudio" : "estudios"}` : ""}
      </p>

      {resume && !wanted && <ResumeStudy study={resume} />}

      {total === 0 &&
        (wanted ? (
          <EmptyState
            title={`Nada coincide con «${query.trim()}»`}
            description="Busca por el nombre del estudio o por el de un jugador de sus partidas."
          />
        ) : (
          <EmptyState
            title={`Nada en «${viewLabel}»`}
            description="Elige otro tipo en la columna, o crea un estudio con «Nuevo estudio»."
          />
        ))}

      {/* The groups are keyed by the view and the order, so changing either
          remounts them and the cards play their entrance again, one after
          another (`--studies-browser-index` sets each one's delay); typing
          does not. */}
      {ownShown.length > 0 && (
        <section key={`own-${viewKey}`} className="studies-browser__group" aria-labelledby={ownTitleId}>
          <h2 id={ownTitleId} className="studies-browser__title">
            Tus estudios
          </h2>
          <div className="studies-browser__grid">
            {ownShown.map((study, index) => (
              <div key={study.id} className="studies-browser__item" style={itemStyle(index)}>
                <StudyCard study={study} />
              </div>
            ))}
          </div>
        </section>
      )}

      {receivedShown.length > 0 && (
        <section key={`received-${viewKey}`} className="studies-browser__group" aria-labelledby={receivedTitleId}>
          <h2 id={receivedTitleId} className="studies-browser__title">
            Recibido <span className="studies-browser__count">{receivedShown.length}</span>
          </h2>
          <div className="studies-browser__grid">
            {receivedShown.map((study, index) => (
              <div
                key={study.id}
                className="studies-browser__item"
                // The received group follows their own, so its cards start after it.
                style={itemStyle(ownShown.length + index)}
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
