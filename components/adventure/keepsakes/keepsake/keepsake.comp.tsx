import type { CSSProperties } from "react";
import { ADVENTURE_KEEPSAKES } from "@/components/adventure/adventure-art.const";
import { SEALED_ENVELOPE_VIEW_BOX, SealedEnvelope } from "@/components/adventure/keepsakes/sealed-envelope.comp";
import "@/components/adventure/adventure.css";
import "./keepsake.comp.css";

interface KeepsakeProps {
  /** The adventure's slug, where the drawing is looked up. */
  adventure: string;
  /** The order of the rival that leaves it. */
  order: number;
  /** The person's name, which the membership card writes. */
  playerName: string;
  /**
   * Stuck on the map: the percentage of the world's width and height of its
   * centre, the percentage of the world's width it measures and its tilt. Left
   * out, it is only the drawing, as wide as what holds it (the rival's card).
   */
  position?: { left: number; top: number; width: number; rotation: number };
  /** Not won yet: the sealed envelope instead of the keepsake. */
  isSealed?: boolean;
}

/**
 * A keepsake a beaten rival leaves in the notebook: a small drawing stuck down
 * with a strip of tape, or, while the rival is still to beat, a sealed
 * envelope. It is decoration — what it is, in words, is the rival's card's —
 * so it is hidden from a screen reader.
 */
export function Keepsake({ adventure, order, playerName, position, isSealed = false }: KeepsakeProps) {
  const drawing = ADVENTURE_KEEPSAKES[adventure]?.[order];
  if (!drawing && !isSealed) return null;
  const Drawing = drawing?.Drawing;
  const viewBox = isSealed ? SEALED_ENVELOPE_VIEW_BOX : drawing!.viewBox;
  return (
    <span
      className={`keepsake keepsake_order_${order}${position ? " keepsake_stuck" : ""}${isSealed ? " keepsake_sealed" : ""}`}
      style={
        position
          ? ({
              left: `${position.left}%`,
              top: `${position.top}%`,
              width: `${position.width}%`,
              "--rotation": `${position.rotation}deg`,
            } as CSSProperties)
          : undefined
      }
      aria-hidden="true"
    >
      <svg className="keepsake__drawing" viewBox={viewBox} focusable="false">
        {isSealed ? <SealedEnvelope /> : Drawing && <Drawing name={playerName} />}
      </svg>
      {position && <i className="keepsake__tape" />}
    </span>
  );
}
