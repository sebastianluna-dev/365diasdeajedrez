"use client";

import { useState } from "react";
import { ArrowLeftIcon } from "@/components/icons/arrow-left-icon.comp";
import { ChessKingPieceIcon } from "@/components/icons/chess-king-piece-icon.comp";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import type { GameEnd } from "@/lib/chess/game-end";
import "./play-vs-engine.comp.css";

/** What the band says once the line ended, from the person's side. */
function endingText(end: GameEnd | null, color: "white" | "black", failed: boolean): string {
  if (failed) return "El módulo dejó de responder. Lo jugado queda como variante.";
  if (!end) return "";
  const how: Record<string, string> = {
    checkmate: "Jaque mate",
    stalemate: "Ahogado",
    "insufficient-material": "Material insuficiente",
    threefold: "Triple repetición",
    "fifty-moves": "Cincuenta jugadas",
  };
  const result = end.winner === null ? "tablas" : end.winner === color ? "ganaste" : "ganó el módulo";
  return `${how[end.kind] ?? "Terminó"}: ${result}.`;
}

interface PlayVsEngineProps {
  /** The colour to move at the node on the board: what is offered first. */
  sideToMove: "white" | "black";
  /** The line being played, or null while analysing. */
  playing: {
    color: "white" | "black";
    status: "your-turn" | "thinking" | "over";
    end: GameEnd | null;
    failed: boolean;
  } | null;
  onStart: (color: "white" | "black") => void;
  /** «Volver al análisis». */
  onStop: () => void;
}

/**
 * «Jugar esta posición contra el módulo» (B, T3). Analysing, it offers the
 * colour — the side to move by default — and the button; playing, it is the
 * blue band that says so, whose turn it is and how it ended, with «Volver al
 * análisis», which leaves what was played as a variation. The module plays at
 * full strength, at once, without a clock, and nothing is saved.
 */
export function PlayVsEngine({ sideToMove, playing, onStart, onStop }: PlayVsEngineProps) {
  const [chosen, setChosen] = useState<"white" | "black" | null>(null);
  const color = chosen ?? sideToMove;

  if (playing) {
    const colour = playing.color === "white" ? "blancas" : "negras";
    const line =
      playing.status === "over"
        ? endingText(playing.end, playing.color, playing.failed)
        : playing.status === "your-turn"
          ? "Te toca mover."
          : "El módulo piensa…";
    return (
      <section className="play-vs-engine play-vs-engine_state_playing" aria-label="Jugando contra el módulo">
        <ChessKingPieceIcon
          variant={playing.color === "white" ? "duotone-light" : "duotone-solid"}
          className="play-vs-engine__piece"
        />
        <div className="play-vs-engine__text">
          <span className="play-vs-engine__title">Juegas con {colour} contra el módulo</span>
          <span className="play-vs-engine__status" aria-live="polite">
            {line}
          </span>
        </div>
        <button type="button" className="platform-button platform-button_size_sm" onClick={onStop}>
          <ArrowLeftIcon variant="classic-solid" className="platform-button__icon" />
          Volver al análisis
        </button>
      </section>
    );
  }

  return (
    <section className="play-vs-engine" aria-labelledby="play-vs-engine-title">
      <h2 id="play-vs-engine-title" className="play-vs-engine__heading">
        Jugar esta posición contra el módulo
      </h2>
      <p className="play-vs-engine__note">
        A máxima potencia y al instante, sin reloj. Lo que juegues queda como variante del análisis.
      </p>
      <PlatformChoiceCards
        aria-label="Juegas con"
        value={color}
        onValueChange={(value) => setChosen(value === "black" ? "black" : "white")}
        options={[
          {
            value: "white",
            label: "Blancas",
            icon: <ChessKingPieceIcon variant="duotone-light" className="play-vs-engine__piece" />,
          },
          {
            value: "black",
            label: "Negras",
            icon: <ChessKingPieceIcon variant="duotone-solid" className="play-vs-engine__piece" />,
          },
        ]}
      />
      <button
        type="button"
        className="platform-button platform-button_variant_ink play-vs-engine__start"
        onClick={() => onStart(color)}
      >
        Jugar contra el módulo
      </button>
    </section>
  );
}
