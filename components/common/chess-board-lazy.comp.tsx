"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type Ref } from "react";
import type { ChessBoardProps } from "./chess-board.comp";
import "./chess-board-lazy.comp.css";

/** How far before it appears on screen it starts loading, in scroll pixels. */
const PRELOAD_MARGIN = "600px 0px";

function ChessBoardPlaceholder({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="chess-board-lazy" aria-hidden="true">
      <div className="chess-board-lazy__board" />
      <div className="chess-board-lazy__toolbar" />
    </div>
  );
}

// `ssr: false` is only allowed inside a Client Component; that is why this
// wrapper exists instead of calling `dynamic` from the section.
const ChessBoard = dynamic(() => import("./chess-board.comp").then((module) => module.ChessBoard), {
  ssr: false,
  loading: () => <ChessBoardPlaceholder />,
});

/**
 * A ChessBoard that stays out of the page's startup: chessground, chessops
 * and the piece stylesheet are only downloaded when the board comes near the
 * screen. It is for boards far below the fold, like the home page's; where
 * the board IS the content (viewer, trainer, explorer) ChessBoard is still
 * used directly.
 *
 * No SSR on purpose: the board's HTML adds nothing indexable, and that way
 * its chunk is not needed to hydrate either. The placeholder reserves the
 * board's exact height (same ratio and same bar) so mounting it moves nothing.
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
