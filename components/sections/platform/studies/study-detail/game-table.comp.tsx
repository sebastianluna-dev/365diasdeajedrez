"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { reorderStudyGames } from "@/services/studies/studies.actions";
import type { StudyGameItem } from "@/services/studies/studies.types";
import "./game-table.comp.css";

interface GameTableProps {
  studyId: string;
  games: StudyGameItem[];
  /** Las bases de curso son de sólo lectura: allí no se arrastra nada. */
  canReorder: boolean;
}

/** Devuelve la lista con el elemento de `from` colocado en `to`. */
function moved<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function GameTable({ studyId, games, canReorder }: GameTableProps) {
  const [items, setItems] = useState(games);
  const [dragging, setDragging] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  // Cuando el servidor revalida llegan partidas nuevas por props. Se ajusta el
  // estado durante el render —no en un efecto— para no pintar una vez con la
  // lista vieja antes de corregirla.
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
      <div className="game-table__card">
        <div className="game-table__head">
          <span>#</span>
          <span>Nombre</span>
          <span>Blancas</span>
          <span>Negras</span>
          <span className="game-table__result-head">Resultado</span>
        </div>

        {items.map((game, index) => (
          <div
            key={game.id}
            className={`game-table__row${dragging === index ? " game-table__row_state_dragging" : ""}`}
            draggable={canReorder}
            onDragStart={() => setDragging(index)}
            onDragEnd={() => setDragging(null)}
            onDragOver={(event) => {
              if (!canReorder || dragging === null || dragging === index) return;
              // Sin esto el navegador no considera la fila un destino válido.
              event.preventDefault();
            }}
            onDrop={(event) => {
              if (!canReorder || dragging === null) return;
              event.preventDefault();
              move(dragging, index);
              setDragging(null);
            }}
          >
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

            <span className="game-table__player">{game.white}</span>
            <span className="game-table__player">{game.black}</span>
            <span className="game-table__result">{game.resultLabel}</span>
          </div>
        ))}
      </div>

      <p className="game-table__note">
        Abre una partida para analizarla.
        {canReorder && " Arrastra una fila por su número para cambiarla de sitio."}
        {anyCited && " Las citadas en clase quedan marcadas."}
      </p>
    </div>
  );
}
