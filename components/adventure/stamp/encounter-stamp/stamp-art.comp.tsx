import { useId, type ComponentType } from "react";
import { ADVENTURE_PORTRAITS } from "@/components/adventure/adventure-art.const";
import { postmarkDate } from "@/lib/adventure/postmark";
import type { EncounterView } from "@/services/adventure/adventure.types";
import { perforated, shade } from "./perforated";
import "@/components/adventure/adventure.css";
import "./stamp-art.comp.css";

interface StampArtProps {
  /** The adventure the rival belongs to: where its portrait is looked up. */
  adventure: string;
  /** The rival: its tint, level and number, and its state (which decides the ink). */
  encounter: Pick<EncounterView, "slug" | "order" | "state" | "elo" | "isFinal" | "beatenAt" | "portrait">;
  /** The place written round the postmark of a beaten rival: «LA TORRE». */
  postmark: string;
  /** Draws a locked stamp with ink, greyed by the card that shows it (never by the map). */
  className?: string;
}

const GOLD = "#d4a440";
const INK = "#26344f";
/** The postal waves of the cancellation, five lines across the stamp. */
const WAVES = Array.from(
  { length: 5 },
  (_, index) => `M-4 ${24 + index * 6}q5.5 -3.4 11 0t11 0t11 0t11 0t11 0t11 0t11 0`,
).join("");
/** The paper's engraved scallops along the top and the bottom of the frame. */
const SCALLOPS = "q6.4 -2 12.8 0t12.8 0t12.8 0t12.8 0t12.8 0t12.8 0t12.8 0t12.8 0";
const SCALLOP_LINES = [0, 1, 2, 3]
  .flatMap((index) => [`M9 ${12 + index * 2.4}${SCALLOPS}`, `M9 ${124 + index * 2.4}${SCALLOPS}`])
  .join("");

/** A wax seal's outline: sixteen lobes round a circle, the same every time. */
function sealPath(radius: number): string {
  const lobes = 16;
  const points = Array.from({ length: lobes * 2 }, (_, index) => {
    const angle = (index / (lobes * 2)) * Math.PI * 2;
    const reach = radius * (index % 2 === 0 ? 1 : 0.9);
    return [Math.cos(angle) * reach, Math.sin(angle) * reach] as const;
  });
  return `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
}
const SEAL = sealPath(25);

/** The blind proof of a stamp still locked: an embossed bust and a padlock drawn in pencil. */
function BlindPortrait({ isFinal }: { isFinal: boolean }) {
  const bust =
    "M50 26C58 26 63.4 32.4 63.4 44C63.4 55 58 66 50 68C42 66 36.6 55 36.6 44C36.6 32.4 42 26 50 26ZM10 112C12 96 25 85 42 81H58C75 85 88 96 90 112Z";
  return (
    <>
      <rect width="100" height="112" fill="#ece3cf" />
      <path d={bust} fill="rgba(255,255,255,.75)" transform="translate(-.9 -.9)" />
      <path d={bust} fill="rgba(120,96,60,.28)" transform="translate(.9 .9)" />
      <path d={bust} fill="#ece3cf" />
      <circle cx="50" cy="55" r="40" fill="none" stroke="rgba(120,96,60,.22)" strokeWidth="1" />
      {!isFinal && (
        <g transform="translate(50 58)" fill="none" stroke="#5f5c58" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-9 -6V-14C-9 -21 -4.6 -24.6 0 -24.6C4.8 -24.6 9.2 -21 9.2 -14V-6" strokeWidth="2.4" />
          <path d="M-15 -6.4H15.4L14.8 15.6H-14.6Z" strokeWidth="2.2" fill="rgba(236,227,207,.92)" />
          <path d="M0.2 1.6V8.6" strokeWidth="2.6" />
          <circle cx="0.2" cy="0.6" r="2.4" strokeWidth="1.8" />
          <path d="M-12 -2.4L12.6 -3M-12.4 12L12.2 12.6" strokeWidth=".7" opacity=".5" />
        </g>
      )}
    </>
  );
}

/**
 * A rival's postage stamp, drawn as the mockup's: the state decides the ink.
 * A beaten rival is inked and cancelled with the dated postmark of its place;
 * the available one is inked and pinned; a locked one is a blind proof with no
 * ink and a pencilled padlock (the last page, a wax seal). It is a drawing of
 * the stamp only — the label under it, and the button that makes it clickable,
 * are `EncounterStamp`'s — so the rival card can show the same stamp large.
 */
export function StampArt({ adventure, encounter, postmark, className }: StampArtProps) {
  const id = useId();
  const Portrait: ComponentType | undefined = ADVENTURE_PORTRAITS[adventure]?.[encounter.slug];
  const isBlind = encounter.state === "locked";
  const date = encounter.beatenAt ? postmarkDate(encounter.beatenAt) : null;

  return (
    <svg
      className={`stamp-art${className ? ` ${className}` : ""}`}
      viewBox="-10 -14 140 178"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${id}-pin`} cx=".36" cy=".34" r=".72">
          <stop offset="0" stopColor="#f0a08a" />
          <stop offset=".45" stopColor="#b9402c" />
          <stop offset="1" stopColor="#5e1810" />
        </radialGradient>
        <path id={`${id}-arc`} d="M73 36A21 21 0 0 1 115 36" />
      </defs>
      <path d={perforated(120, 150, 3.4, 10.6)} fill={isBlind ? "#f6f0e2" : "#fcf8ee"} />

      {isBlind ? (
        <>
          <rect x="6" y="6" width="108" height="138" fill="#f6f0e2" />
          <rect
            x="9.5"
            y="9.5"
            width="101"
            height="131"
            fill="none"
            stroke="rgba(255,255,255,.9)"
            strokeWidth="1.4"
            transform="translate(-.7 -.7)"
          />
          <rect
            x="9.5"
            y="9.5"
            width="101"
            height="131"
            fill="none"
            stroke="rgba(120,96,60,.3)"
            strokeWidth="1.2"
            transform="translate(.7 .7)"
          />
          <svg x="15" y="21" width="90" height="100" viewBox="0 0 100 112" preserveAspectRatio="xMidYMid slice">
            <BlindPortrait isFinal={encounter.isFinal} />
          </svg>
          <text className="stamp-art__title" x="16" y="136" fontSize="15" fontWeight="700" fill="rgba(120,96,60,.32)">
            {encounter.elo}
          </text>
          {encounter.isFinal && (
            <>
              <rect x="6" y="6" width="108" height="138" fill="none" stroke={GOLD} strokeWidth="2.2" opacity=".85" />
              <rect x="11" y="11" width="98" height="128" fill="none" stroke={GOLD} strokeWidth=".8" opacity=".7" />
              <g transform="translate(60 72)">
                <path d={SEAL} fill="#5e1810" transform="translate(1.6 2.6)" opacity=".45" />
                <path d={SEAL} fill="#8f2a20" />
                <circle r="17" fill="#a1352a" />
                <circle r="17" fill="none" stroke="#6e1d14" strokeWidth="1.2" />
                <path d="M-11 6h22l-1.6 -10 -5 4.6L0 -9.4l-4.4 9.6 -5 -4.6z" fill="#6e1d14" />
                <circle cy="-12" r="2" fill="#6e1d14" />
                <path d="M-9 -3l2 2M9 -3l-2 2" fill="none" stroke="#c75a48" strokeWidth="1" strokeLinecap="round" />
              </g>
            </>
          )}
        </>
      ) : (
        <>
          <rect x="9" y="9" width="102" height="132" fill={shade(encounter.portrait.background, 0.12)} />
          <path d={SCALLOP_LINES} fill="none" stroke="#fff8e8" strokeWidth=".5" opacity=".35" strokeLinecap="round" />
          <text
            className="stamp-art__mono"
            x="60"
            y="18.6"
            textAnchor="middle"
            fontSize="6.6"
            fontWeight="600"
            fill="#fffaf0"
            letterSpacing="1.6"
          >
            CORREO DE AJEDREZ
          </text>
          <svg x="15" y="21" width="90" height="100" viewBox="0 0 100 112" preserveAspectRatio="xMidYMid slice">
            {Portrait && <Portrait />}
          </svg>
          <text className="stamp-art__title" x="15.5" y="137" fontSize="15.5" fontWeight="700" fill="#fffaf0">
            {encounter.elo}
          </text>
          <text
            className="stamp-art__mono"
            x="105"
            y="136"
            textAnchor="end"
            fontSize="7"
            fontWeight="600"
            fill="#fffaf0"
            letterSpacing=".6"
          >
            {`N.º ${encounter.order}`}
          </text>
          {encounter.isFinal && (
            <rect x="12" y="12" width="96" height="126" fill="none" stroke={GOLD} strokeWidth="1.2" />
          )}
        </>
      )}

      {encounter.state === "beaten" && date && (
        <g className="stamp-art__postmark" opacity=".8" transform="rotate(-8 94 36)">
          <circle cx="94" cy="36" r="24.5" fill="none" stroke={INK} strokeWidth="1.7" />
          <circle cx="94" cy="36" r="16.5" fill="none" stroke={INK} strokeWidth=".9" />
          <text className="stamp-art__mono" fontSize="6.4" fontWeight="600" fill={INK} letterSpacing="1">
            <textPath href={`#${id}-arc`} startOffset="50%" textAnchor="middle">
              {postmark}
            </textPath>
          </text>
          <text className="stamp-art__mono" x="94" y="36" textAnchor="middle" fontSize="8" fontWeight="600" fill={INK}>
            {`${date.day} ${date.month}`}
          </text>
          <text className="stamp-art__mono" x="94" y="44" textAnchor="middle" fontSize="6.2" fill={INK}>
            {date.year}
          </text>
          <path d={WAVES} fill="none" stroke={INK} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {encounter.state === "available" && (
        <g className="stamp-art__pin">
          <ellipse cx="64" cy="9" rx="10" ry="4.4" fill="rgba(40,20,10,.28)" />
          <path d="M60 4L66 22" fill="none" stroke="#8d949b" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="60" cy="2" r="8.6" fill={`url(#${id}-pin)`} />
          <circle cx="57" cy="-1" r="2.3" fill="rgba(255,255,255,.75)" />
        </g>
      )}
    </svg>
  );
}
