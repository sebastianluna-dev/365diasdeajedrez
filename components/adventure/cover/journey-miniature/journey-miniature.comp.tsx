import { useId } from "react";
import type { AdventureMiniature, ArtPathStop } from "@/lib/adventure/adventure.types";
import type { EncounterState } from "@/services/adventure/adventure.types";
import "@/components/adventure/adventure.css";
import "./journey-miniature.comp.css";

interface JourneyMiniatureProps {
  /** The adventure's slug: its scenery is `public/aventuras/<slug>/miniatura-alta.svg` (or `-ancha`). */
  adventure: string;
  /** Where the path goes, from the adventure's art (`AdventureArt.miniature`). */
  art: AdventureMiniature;
  /** Each rival's state, in the order of the story: the first is rival 1. */
  states: readonly EncounterState[];
  /** The tall one is for the open notebook; the wide one for a phone, and for the shelf's card. */
  variant: "tall" | "wide";
  /** What the drawing says to a screen reader. */
  label: string;
}

type Point = readonly [x: number, y: number];

/** A smooth curve through the stops (Catmull-Rom turned into cubic Béziers). */
function smoothPath(points: readonly Point[]): string {
  const [first, ...rest] = points;
  if (!first) return "";
  let d = `M${first[0]} ${first[1]}`;
  for (let index = 0; index < rest.length; index += 1) {
    const before = points[Math.max(index - 1, 0)]!;
    const from = points[index]!;
    const to = points[index + 1]!;
    const after = points[Math.min(index + 2, points.length - 1)]!;
    const one: Point = [from[0] + (to[0] - before[0]) / 6, from[1] + (to[1] - before[1]) / 6];
    const two: Point = [to[0] - (after[0] - from[0]) / 6, to[1] - (after[1] - from[1]) / 6];
    d += `C${one[0].toFixed(1)} ${one[1].toFixed(1)} ${two[0].toFixed(1)} ${two[1].toFixed(1)} ${to[0]} ${to[1]}`;
  }
  return d;
}

/** How far along the path (0 to 100) the stop at `index` is, by the length of the polyline through the stops. */
function percentAt(points: readonly Point[], index: number): number {
  const lengths = points.slice(1).map((point, at) => Math.hypot(point[0] - points[at]![0], point[1] - points[at]![1]));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const done = lengths.slice(0, Math.max(index, 0)).reduce((sum, length) => sum + length, 0);
  return total === 0 ? 0 : (done / total) * 100;
}

/**
 * The whole journey in one small picture: cut-paper scenery, from the plaza to
 * the palace, with the path sewn over it and the twelve stamps on their
 * places. A rival's stamp is filled when it is beaten, framed in brick when it
 * is the one to play and grey while it is locked; the thread is solid as far
 * as the person has got.
 *
 * The scenery is the adventure's exported art (`public/aventuras/<slug>/`,
 * `npm run adventure:art`); only the path comes from the art file.
 */
export function JourneyMiniature({ adventure, art, states, variant, label }: JourneyMiniatureProps) {
  const id = useId();
  const points: Point[] = art.path.map((stop: ArtPathStop) => [stop[0], stop[1]]);
  const stopIndexOf = (order: number) => art.path.findIndex((stop) => stop[2] === order);
  const current = states.findIndex((state) => state === "available");
  // The thread is solid up to the available stamp, or to the palace when every page is written.
  const reachedIndex = current === -1 ? points.length - 1 : stopIndexOf(current + 1);
  const progress = states.every((state) => state === "locked") ? 0 : percentAt(points, reachedIndex);
  const [x, y, width, height] = art.viewBox;
  const path = smoothPath(points);

  return (
    <svg
      className={`journey-miniature journey-miniature_variant_${variant}`}
      viewBox={`${x} ${y} ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label}
    >
      <defs>
        <clipPath id={`${id}-clip`}>
          <rect x={x} y={y} width={width} height={height} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <image
          href={`/aventuras/${adventure}/miniatura-${variant === "tall" ? "alta" : "ancha"}.svg`}
          x={x}
          y={y}
          width={width}
          height={height}
          preserveAspectRatio="none"
        />
        <path className="journey-miniature__tape" d={path} />
        <path className="journey-miniature__thread" d={path} />
        <path className="journey-miniature__sewn" d={path} pathLength={100} strokeDasharray={`${progress} 100`} />
        {art.path.map((stop) => {
          const order = stop[2];
          if (order === undefined) return null;
          const state = states[order - 1] ?? "locked";
          const isFinal = order === states.length;
          return (
            <g
              key={order}
              className={`journey-miniature__stamp journey-miniature__stamp_state_${state}${isFinal ? " journey-miniature__stamp_final" : ""}`}
              transform={`translate(${stop[0]} ${stop[1]})`}
            >
              {isFinal ? (
                <circle className="journey-miniature__wax" r="9" />
              ) : (
                <rect
                  className="journey-miniature__paper"
                  x={state === "available" ? -8.5 : -7}
                  y={state === "available" ? -11 : -9}
                  width={state === "available" ? 17 : 14}
                  height={state === "available" ? 22 : 18}
                  rx="1"
                />
              )}
              {state === "beaten" && !isFinal && <circle className="journey-miniature__postmark" cx="3" cy="4" r="4" />}
              {state === "locked" && (
                <path className="journey-miniature__lock" d="M-3 1.5h6v5h-6zM-2 1.5v-2a2 2 0 0 1 4 0v2" />
              )}
              {state === "available" && <circle className="journey-miniature__pin" cx="0" cy="-11" r="2.6" />}
              {state === "beaten" && isFinal && <path className="journey-miniature__check" d="M-4 0l3 3l5-6" />}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
