"use client";

import { useState } from "react";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import type { GameEnd } from "@/lib/chess/game-end";
import { mdButton } from "@/lib/material/material-classes";
import "./play-vs-engine.comp.css";

/** What the box says once the line ended, from the person's side. */
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

/** The colour's mark: a white disc or a black one, as the pieces are. */
function SideDot({ side }: { side: "white" | "black" }) {
  return <span className={`play-vs-engine__dot play-vs-engine__dot_side_${side}`} aria-hidden="true" />;
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
 * «Jugar contra el módulo» (B, T3), the box of the side column's group of
 * that name (the new design system, 2026-10-23). Analysing, it offers the
 * colour — the side to move by default — and «Jugar esta posición»; playing,
 * the box turns pale blue and says which colour the person has,
 * that what is played stays as a variation — or how it ended —, with «Volver
 * al análisis». Whose turn it is is said on the panel, in the engine's place
 * (`GameViewer`'s `play.headline`). The module plays at full strength, at
 * once, without a clock, and nothing is saved.
 */
export function PlayVsEngine({ sideToMove, playing, onStart, onStop }: PlayVsEngineProps) {
  const [chosen, setChosen] = useState<"white" | "black" | null>(null);
  const color = chosen ?? sideToMove;

  if (playing) {
    const colour = playing.color === "white" ? "blancas" : "negras";
    const ending = playing.status === "over" ? endingText(playing.end, playing.color, playing.failed) : "";
    return (
      <section className="play-vs-engine play-vs-engine_state_playing" aria-label="Jugando contra el módulo">
        <p className="play-vs-engine__title">
          <SideDot side={playing.color} />
          Juegas con {colour}
        </p>
        <p className="play-vs-engine__note" aria-live="polite">
          {ending || "Lo que juegues queda como variante del análisis."}
        </p>
        <button type="button" className={`${mdButton("elevated", "sm")} play-vs-engine__back`} onClick={onStop}>
          <XmarkIcon variant="classic-solid" className="platform-md-icon" />
          Volver al análisis
        </button>
      </section>
    );
  }

  return (
    <section className="play-vs-engine" aria-label="Jugar contra el módulo">
      <PlatformChoiceCards
        aria-label="Juegas con"
        layout="line"
        value={color}
        onValueChange={(value) => setChosen(value === "black" ? "black" : "white")}
        options={[
          { value: "white", label: "Blancas", icon: <SideDot side="white" /> },
          { value: "black", label: "Negras", icon: <SideDot side="black" /> },
        ]}
      />
      <button
        type="button"
        className={`${mdButton("tonal", "sm")} play-vs-engine__start`}
        onClick={() => onStart(color)}
      >
        <PlayIcon variant="classic-solid" className="platform-md-icon" />
        Jugar esta posición
      </button>
    </section>
  );
}
