"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { PlatformTable, PlatformTableCell, PlatformTableRow } from "@/components/platform/shared/platform-table.comp";
import { reorderStudyGames } from "@/services/studies/studies.actions";
import type { StudyGameItem } from "@/services/studies/studies.types";
import "./game-table.comp.css";

interface GameTableProps {
  studyId: string;
  games: StudyGameItem[];
  /** Course databases are read-only: nothing is dragged there. */
  canReorder: boolean;
}

const COLUMNS = ["#", "Nombre", "Blancas", "Negras", { label: "Resultado", align: "right" }] as const;

/** Returns the list with the item at `from` placed at `to`. */
function moved<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  if (item === undefined) return items;
  next.splice(to, 0, item);
  return next;
}

export function GameTable({ studyId, games, canReorder }: GameTableProps) {
  const [items, setItems] = useState(games);
  const [dragging, setDragging] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // When the server revalidates, new games arrive through props. The state is
  // adjusted during render — not in an effect — so as not to paint once with
  // the old list before correcting it.
  const [baseline, setBaseline] = useState(games);
  if (games !== baseline) {
    setBaseline(games);
    setItems(games);
  }

  const commit = (next: StudyGameItem[]) => {
    setItems(next);
    startTransition(() => {
      void reorderStudyGames(
        studyId,
        next.map((game) => game.id),
      );
    });
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    commit(moved(items, from, to));
  };

  const anyCited = items.some((game) => game.citedInClass);

  return (
    <div className="game-table">
      <PlatformTable columns={COLUMNS} emptyLabel="Este estudio todavía no tiene partidas." minWidth={560}>
        {items.map((game, index) => (
          <PlatformTableRow
            key={game.id}
            className={`game-table__row${dragging === index ? " game-table__row_state_dragging" : ""}`}
            draggable={canReorder}
            onDragStart={() => setDragging(index)}
            onDragEnd={() => setDragging(null)}
            onDragOver={(event) => {
              if (!canReorder || dragging === null || dragging === index) return;
              // Without this the browser does not consider the row a valid drop target.
              event.preventDefault();
            }}
            onDrop={(event) => {
              if (!canReorder || dragging === null) return;
              event.preventDefault();
              move(dragging, index);
              setDragging(null);
            }}
          >
            <PlatformTableCell>
              {canReorder ? (
                <button
                  type="button"
                  className="game-table__handle"
                  aria-label={`Mover «${game.label}». Usa las flechas arriba y abajo para cambiarla de sitio.`}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      move(index, index - 1);
                    } else if (event.key === "ArrowDown") {
                      event.preventDefault();
                      move(index, index + 1);
                    }
                  }}
                >
                  <span className="game-table__number" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="game-table__grip" aria-hidden="true">
                    ⠿
                  </span>
                </button>
              ) : (
                <span className="game-table__number">{index + 1}</span>
              )}
            </PlatformTableCell>

            <PlatformTableCell strong>
              <span className="game-table__name">
                <Link href={game.href} className="game-table__link">
                  {game.label}
                </Link>
                {game.citedInClass && (
                  <span className="game-table__cited" title="Citada en una clase">
                    En clase
                  </span>
                )}
              </span>
            </PlatformTableCell>

            <PlatformTableCell>{game.white}</PlatformTableCell>
            <PlatformTableCell>{game.black}</PlatformTableCell>
            <PlatformTableCell align="right">
              <span className="game-table__result">{game.resultLabel}</span>
            </PlatformTableCell>
          </PlatformTableRow>
        ))}
      </PlatformTable>

      <p className="game-table__note">
        Abre una partida para analizarla.
        {canReorder && " Arrastra una fila por su número para cambiarla de sitio."}
        {anyCited && " Las citadas en clase quedan marcadas."}
      </p>
    </div>
  );
}
