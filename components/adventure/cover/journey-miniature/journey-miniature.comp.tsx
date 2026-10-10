import { useId } from "react";
import type { AdventureMiniature, ArtPathStop } from "@/lib/adventure/adventure.types";
import type { EncounterState } from "@/services/adventure/adventure.types";
import "@/components/adventure/adventure.css";
import "./journey-miniature.comp.css";

interface JourneyMiniatureProps {
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

/** A pair of stars and a moon over the night: fixed points, so the drawing is the same every time. */
const STARS: readonly (readonly [x: number, y: number, r: number])[] = [
  [20, -20, 1.4],
  [70, 10, 1],
  [120, -25, 1.2],
  [160, 40, 0.9],
  [230, -10, 1.3],
  [280, 30, 1],
  [350, 55, 1.2],
  [-10, 60, 1],
];

/** The tall scenery: the plaza at the foot of the page and the palace at the top, in the night. */
function TallScenery({ shadow }: { shadow: string }) {
  return (
    <g>
      <rect x="-60" y="-60" width="520" height="700" fill="#e8dcc0" />
      {/* The night: the sky, its stars and moon, and three ridges stepping down. */}
      <path d="M-60 -60H460V330H-60Z" fill="#1d2440" />
      {STARS.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y + 20} r={r} fill="#f6efe0" />
      ))}
      <circle cx="340" cy="0" r="22" fill="#f1e7c6" />
      <circle cx="350" cy="-6" r="19" fill="#1d2440" />
      <path
        d="M-60 120 L30 92 L100 126 L190 78 L270 122 L340 92 L460 134 V400 H-60Z"
        fill="#262f50"
        filter={`url(#${shadow})`}
      />
      <path d="M-60 205 Q40 150 130 188 T300 172 T460 196 V400 H-60Z" fill="#36426a" filter={`url(#${shadow})`} />
      {/* The hill and the palace on it, with its dome, its two towers and its stairs. */}
      <path d="M-60 330 Q60 262 140 200 Q180 166 220 200 Q300 262 460 330 V420 H-60Z" fill="#35524a" />
      <g filter={`url(#${shadow})`}>
        <path d="M120 150 H240 L252 160 H108Z" fill="#d6c9ad" />
        <rect x="124" y="64" width="112" height="86" fill="#efe5cf" />
        <rect x="108" y="40" width="26" height="110" fill="#e6dcc0" />
        <rect x="226" y="40" width="26" height="110" fill="#e6dcc0" />
        <path d="M108 40 l4 -10 h4 l2 4 l2 -4 h4 l4 10Z M226 40 l4 -10 h4 l2 4 l2 -4 h4 l4 10Z" fill="#e6dcc0" />
        <path d="M148 64 Q180 14 212 64Z" fill="#a8322a" />
        <rect x="178" y="8" width="4" height="14" fill="#c9a274" />
        <path d="M168 150 V110 Q180 96 192 110 V150Z" fill="#6e4630" />
        {[132, 148, 204, 220].map((x) => (
          <rect key={x} x={x} y="82" width="8" height="12" fill="#d39f45" />
        ))}
        {[114, 232].map((x) => (
          <rect key={x} x={x} y="68" width="6" height="10" fill="#d39f45" />
        ))}
      </g>
      {/* The hotel's city on the hill: a skyline in purple with its windows lit. */}
      <path
        d="M-60 262 V230 H-30 V212 H10 V240 H40 V222 H72 V250 H104 V236 H140 V258 H170 V228 H206 V250 H240 V214 H284 V246 H330 V226 H370 V252 H460 V340 H-60Z"
        fill="#8c7a96"
        filter={`url(#${shadow})`}
      />
      {[-10, 28, 92, 188, 262, 348].map((x, index) => (
        <g key={x} fill="#f2c36b">
          <rect x={x} y={236 - (index % 3) * 4} width="5" height="7" />
          <rect x={x + 10} y={246 - (index % 2) * 6} width="5" height="7" />
        </g>
      ))}
      <g filter={`url(#${shadow})`}>
        <rect x="282" y="160" width="62" height="104" fill="#e3c9a8" />
        <rect x="278" y="154" width="70" height="10" fill="#8f6440" />
        <rect x="294" y="176" width="9" height="12" fill="#f2c36b" />
        <rect x="322" y="176" width="9" height="12" fill="#f2c36b" />
        <rect x="294" y="204" width="9" height="12" fill="#f2c36b" />
        <rect x="322" y="204" width="9" height="12" fill="#f2c36b" />
        <rect x="306" y="236" width="14" height="28" fill="#6e4630" />
      </g>
      {/* The malecon: the sea, its waves, a boat and the lighthouse. */}
      <path
        d="M-60 268 Q40 258 130 270 T300 266 T460 272 V348 Q330 360 200 348 T-60 350Z"
        fill="#5a8c9c"
        filter={`url(#${shadow})`}
      />
      <path
        d="M-30 292 q16 -9 32 0 t32 0 t32 0 M110 310 q16 -9 32 0 t32 0 t32 0 M240 288 q16 -9 32 0 t32 0 M20 330 q16 -9 32 0 t32 0"
        fill="none"
        stroke="#9cc0c4"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M180 300 h30 l-6 10 h-18Z" fill="#efe5cf" />
      <path d="M195 270 V298 L216 298Z" fill="#fbf7ec" />
      <rect x="342" y="262" width="14" height="46" fill="#fbf7ec" />
      <rect x="342" y="276" width="14" height="8" fill="#a8322a" />
      <rect x="342" y="292" width="14" height="8" fill="#a8322a" />
      <path d="M338 262 h22 l-4 -8 h-14Z" fill="#a8322a" />
      {/* The library: a dome over a reading room, on the lawn. */}
      <path d="M-60 372 Q40 356 150 372 T330 366 T460 376 V480 H-60Z" fill="#7f9a7b" filter={`url(#${shadow})`} />
      <g filter={`url(#${shadow})`}>
        <rect x="296" y="352" width="76" height="40" fill="#f1e5c8" />
        <path d="M312 352 Q334 322 356 352Z" fill="#7fb2a6" />
        <rect x="302" y="364" width="64" height="5" fill="#c9a274" />
        {[304, 318, 332, 346, 358].map((x) => (
          <rect key={x} x={x} y="372" width="4" height="20" fill="#d6c9ad" />
        ))}
      </g>
      {/* The club: a low house with a red roof, and its green. */}
      <path d="M-60 440 Q60 424 170 440 T340 434 T460 444 V520 H-60Z" fill="#a0b88c" filter={`url(#${shadow})`} />
      <g filter={`url(#${shadow})`}>
        <rect x="290" y="408" width="62" height="38" fill="#d39f45" />
        <path d="M284 410 L321 386 L358 410Z" fill="#a8322a" />
        <rect x="318" y="424" width="12" height="22" fill="#6e4630" />
        <rect x="298" y="418" width="10" height="9" fill="#fbf7ec" />
        <rect x="336" y="418" width="10" height="9" fill="#fbf7ec" />
      </g>
      {/* The plaza: sand, the stone ring and the jacaranda. */}
      <path d="M-60 500 Q50 480 160 498 T340 492 T460 502 V640 H-60Z" fill="#e5d2a6" filter={`url(#${shadow})`} />
      <ellipse cx="190" cy="548" rx="78" ry="18" fill="#d6c9ad" />
      <g filter={`url(#${shadow})`}>
        <rect x="26" y="508" width="6" height="34" fill="#6e4630" />
        <circle cx="20" cy="500" r="20" fill="#8a6fb0" />
        <circle cx="40" cy="494" r="18" fill="#a287c4" />
        <circle cx="30" cy="482" r="16" fill="#8a6fb0" />
        <path d="M312 520 V490 M296 496 Q312 478 328 496Z" fill="#a8322a" stroke="#6e4630" strokeWidth="2" />
      </g>
    </g>
  );
}

/** The wide scenery, for a phone: the journey from the plaza at the left to the palace at the right. */
function WideScenery({ shadow }: { shadow: string }) {
  return (
    <g>
      <rect x="-40" y="-40" width="460" height="320" fill="#e8dcc0" />
      {/* The night in the upper right: the sky, a moon and the palace's hill. */}
      <path d="M200 -40 H420 V280 H300 Q250 150 200 60Z" fill="#1d2440" />
      {STARS.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={210 + x * 0.5} cy={y * 0.8 + 10} r={r} fill="#f6efe0" />
      ))}
      <circle cx="352" cy="2" r="14" fill="#f1e7c6" />
      <circle cx="358" cy="-2" r="12" fill="#1d2440" />
      <path d="M230 160 Q290 80 330 70 Q370 80 420 130 V280 H260Z" fill="#35524a" filter={`url(#${shadow})`} />
      <g filter={`url(#${shadow})`}>
        <rect x="302" y="42" width="52" height="36" fill="#efe5cf" />
        <rect x="294" y="30" width="12" height="48" fill="#e6dcc0" />
        <rect x="350" y="30" width="12" height="48" fill="#e6dcc0" />
        <path d="M312 42 Q328 14 344 42Z" fill="#a8322a" />
        <path d="M322 78 V60 Q328 52 334 60 V78Z" fill="#6e4630" />
        <rect x="312" y="50" width="4" height="6" fill="#d39f45" />
        <rect x="340" y="50" width="4" height="6" fill="#d39f45" />
      </g>
      {/* The hotel, among the city's purple blocks. */}
      <path
        d="M236 196 V170 H254 V154 H276 V176 H294 V160 H312 V182 H332 V166 H360 V200 Z"
        fill="#8c7a96"
        filter={`url(#${shadow})`}
      />
      <g filter={`url(#${shadow})`}>
        <rect x="262" y="124" width="34" height="76" fill="#e3c9a8" />
        <rect x="259" y="120" width="40" height="7" fill="#8f6440" />
        {[132, 148, 164].map((y) => (
          <g key={y} fill="#f2c36b">
            <rect x="268" y={y} width="6" height="8" />
            <rect x="282" y={y} width="6" height="8" />
          </g>
        ))}
      </g>
      {/* The sea along the bottom, from the library to the hotel. */}
      <path d="M130 232 Q170 214 214 224 T330 214 V280 H130Z" fill="#5a8c9c" filter={`url(#${shadow})`} />
      <path
        d="M146 246 q10 -6 20 0 t20 0 t20 0 M210 260 q10 -6 20 0 t20 0 t20 0 M250 238 q10 -6 20 0 t20 0"
        fill="none"
        stroke="#9cc0c4"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M200 240 h20 l-4 8 h-12Z" fill="#efe5cf" />
      <path d="M210 222 V238 L224 238Z" fill="#fbf7ec" />
      <rect x="346" y="196" width="10" height="30" fill="#fbf7ec" />
      <rect x="346" y="204" width="10" height="6" fill="#a8322a" />
      <rect x="346" y="216" width="10" height="6" fill="#a8322a" />
      {/* The library and the club on the greens in the middle. */}
      <path d="M-40 150 Q40 136 110 150 T210 146 V280 H-40Z" fill="#a0b88c" filter={`url(#${shadow})`} />
      <g filter={`url(#${shadow})`}>
        <rect x="120" y="96" width="42" height="30" fill="#f1e5c8" />
        <path d="M130 96 Q141 74 152 96Z" fill="#7fb2a6" />
        <rect x="126" y="106" width="30" height="4" fill="#c9a274" />
        <rect x="64" y="124" width="34" height="26" fill="#d39f45" />
        <path d="M60 126 L81 108 L102 126Z" fill="#a8322a" />
        <rect x="76" y="136" width="9" height="14" fill="#6e4630" />
      </g>
      {/* The plaza at the lower left, with its jacaranda. */}
      <path d="M-40 196 Q20 186 80 198 T150 200 V280 H-40Z" fill="#e5d2a6" filter={`url(#${shadow})`} />
      <ellipse cx="34" cy="228" rx="52" ry="14" fill="#d6c9ad" />
      <g filter={`url(#${shadow})`}>
        <rect x="108" y="198" width="5" height="22" fill="#6e4630" />
        <circle cx="102" cy="192" r="14" fill="#8a6fb0" />
        <circle cx="118" cy="188" r="12" fill="#a287c4" />
        <circle cx="110" cy="180" r="11" fill="#8a6fb0" />
      </g>
    </g>
  );
}

/**
 * The whole journey in one small picture: cut-paper scenery, from the plaza to
 * the palace, with the path sewn over it and the twelve stamps on their
 * places. A rival's stamp is filled when it is beaten, framed in brick when it
 * is the one to play and grey while it is locked; the thread is solid as far
 * as the person has got.
 *
 * It is a drawing of its own until the adventure's real art is exported
 * (`public/aventuras/<slug>/`); only the path comes from the art file.
 */
export function JourneyMiniature({ art, states, variant, label }: JourneyMiniatureProps) {
  const id = useId();
  const shadow = `${id}-lift`;
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
        <filter id={shadow} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2a1c0e" floodOpacity="0.35" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <rect x={x} y={y} width={width} height={height} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        {variant === "tall" ? <TallScenery shadow={shadow} /> : <WideScenery shadow={shadow} />}
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
