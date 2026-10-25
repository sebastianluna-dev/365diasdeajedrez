"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { BotScoreboard, type BotScoreboardProps } from "@/components/chess/bot-scoreboard/bot-scoreboard.comp";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon.comp";
import { ChessBoardIcon } from "@/components/icons/chess-board-icon.comp";
import { FloppyDiskIcon } from "@/components/icons/floppy-disk-icon.comp";
import { MagnifyingGlassChartIcon } from "@/components/icons/magnifying-glass-chart-icon.comp";
import { mdButton } from "@/lib/material/material-classes";
import "./game-over-actions.comp.css";

/** What the game's page gives the viewer for when a game against a bot is over. */
export interface GameOverActionsData {
  /** The record against this rival, counting the game just finished. */
  scoreboard: BotScoreboardProps | null;
  /**
   * The one main action, a link with the arrow on its right: «Volver al mapa»
   * after a game of an adventure, «Ir a Jugar» after an old free game. Null
   * where there is nowhere to go on to (the adventure switched off). Since
   * 2026-10-25 there is no «Revancha» nor «Otro rival»: every game against a
   * bot is an encounter of an adventure, and the story goes on on its map.
   */
  onwards: { href: string; label: string } | null;
  /** «Tablero de análisis»: the game on the analysis board; null while that board is switched off. */
  analysisBoardHref: string | null;
  /** «Guardar en un estudio»: the page opens its popup. */
  onSave: (event: MouseEvent<HTMLButtonElement>) => void;
}

interface GameOverActionsProps extends GameOverActionsData {
  /** «Analizar»: the viewer opens its review under the board. Without it, the button is not drawn. */
  onAnalyse?: () => void;
}

/**
 * What can be done once a game against a bot is over, UNDER the board (G6):
 * nothing covers the board, the result is already in the strips, and the game
 * stays there to be gone through. The way on (`onwards`) is the one main
 * action, and the scoreboard against that rival closes it. In the new design
 * system, as the game's page is (2026-10-25): Material's buttons — the way on
 * filled, «Analizar» tonal, the rest outlined.
 */
export function GameOverActions({ scoreboard, onwards, analysisBoardHref, onSave, onAnalyse }: GameOverActionsProps) {
  return (
    <div className="game-over-actions">
      <div className="game-over-actions__buttons">
        {onwards && (
          <Link href={onwards.href} className={mdButton("filled", "sm")}>
            {onwards.label}
            <ArrowRightIcon variant="classic-solid" className="platform-md-icon" />
          </Link>
        )}
        {onAnalyse && (
          <button type="button" className={mdButton("tonal", "sm")} onClick={onAnalyse}>
            <MagnifyingGlassChartIcon variant="classic-solid" className="platform-md-icon" />
            Analizar
          </button>
        )}
        {analysisBoardHref && (
          <Link href={analysisBoardHref} className={mdButton("outlined", "sm")}>
            <ChessBoardIcon variant="classic-solid" className="platform-md-icon" />
            Tablero de análisis
          </Link>
        )}
        <button type="button" className={mdButton("outlined", "sm")} onClick={onSave}>
          <FloppyDiskIcon variant="classic-solid" className="platform-md-icon" />
          Guardar en un estudio
        </button>
      </div>

      {scoreboard && <BotScoreboard {...scoreboard} />}
    </div>
  );
}
