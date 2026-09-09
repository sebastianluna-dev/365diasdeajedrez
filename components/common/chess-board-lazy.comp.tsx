"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type Ref } from "react";
import type { ChessBoardProps } from "./chess-board.comp";
import "./chess-board-lazy.comp.css";

/** Cuánto antes de asomar por la pantalla empieza a cargar, en píxeles de scroll. */
const PRELOAD_MARGIN = "600px 0px";

function ChessBoardPlaceholder({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="chess-board-lazy" aria-hidden="true">
      <div className="chess-board-lazy__board" />
      <div className="chess-board-lazy__toolbar" />
    </div>
  );
}

// `ssr: false` sólo se admite dentro de un Client Component; por eso este
// envoltorio existe en vez de llamar a `dynamic` desde la sección.
const ChessBoard = dynamic(() => import("./chess-board.comp").then((module) => module.ChessBoard), {
  ssr: false,
  loading: () => <ChessBoardPlaceholder />,
});

/**
 * ChessBoard que no entra en el arranque de la página: chessground, chessops
 * y la hoja con las piezas sólo se descargan cuando el tablero se acerca a la
 * pantalla. Es para tableros muy por debajo del pliegue, como el de la
 * portada; donde el tablero ES el contenido (visor, entrenador, explorador)
 * se sigue usando ChessBoard directamente.
 *
 * Sin SSR a propósito: el HTML del tablero no aporta nada indexable y así su
 * chunk tampoco hace falta para hidratar. El hueco reserva el alto exacto del
 * tablero (misma proporción y misma barra) para que montarlo no mueva nada.
 */
export function ChessBoardLazy(props: ChessBoardProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: PRELOAD_MARGIN },
    );
    observer.observe(slot);
    return () => observer.disconnect();
  }, []);

  if (!isNear) return <ChessBoardPlaceholder ref={slotRef} />;
  return <ChessBoard {...props} />;
}
