import Image from "next/image";
import { useId, useMemo, useRef, type CSSProperties } from "react";
import { Keepsake } from "@/components/adventure/keepsakes/keepsake/keepsake.comp";
import { Needle } from "@/components/adventure/map/needle.comp";
import { PATH_MARKS } from "@/components/adventure/map/path-marks.const";
import { PlayerToken } from "@/components/adventure/map/player-token.comp";
import { useSeamTravel, useTokenTravel } from "@/components/adventure/map/use-victory-travel.hook";
import { inPhases, type VictorySequence } from "@/components/adventure/map/use-victory-sequence.hook";
import { NotePage } from "@/components/adventure/note-page/note-page/note-page.comp";
import { EncounterStamp, type StampPhase } from "@/components/adventure/stamp/encounter-stamp/encounter-stamp.comp";
import type { AdventureLayout, AdventureZoneSeed } from "@/lib/adventure/adventure.types";
import { arrowPath, seamOf, travelOf, zoneAt, type PathMark } from "@/lib/adventure/map-geometry";
import type { AdventureProgressView } from "@/services/adventure/adventure.types";
import "@/components/adventure/adventure.css";
import "./map-layer.comp.css";

/** The three layouts of an adventure's art, chosen by the width of the window (the stylesheet). */
export type MapLayerSize = "desktop" | "tablet" | "mobile";

/** The scenery's file of each layout, in `public/aventuras/<slug>/`. */
const SCENERY_FILE: Record<MapLayerSize, string> = { desktop: "escritorio", tablet: "tableta", mobile: "movil" };

/** How far the scenery's paper runs past the art's box on each side, and above it (the art's bleed). */
const BLEED_X = 700;
const BLEED_TOP = 40;

interface MapLayerProps {
  size: MapLayerSize;
  layout: AdventureLayout;
  zones: readonly AdventureZoneSeed[];
  progress: AdventureProgressView;
  /** The person, for the token's initials and the membership card's name. */
  player: { initials: string; name: string };
  /** The victory being played, if one is: what it asks of each piece, and what the layer animates itself. */
  sequence: VictorySequence | null;
  /** A stamp was pressed: the host opens that rival's card. */
  onOpen: (order: number, trigger: HTMLElement) => void;
}

const round = (value: number) => Math.round(value * 1000) / 1000;

/** What each stamp draws of the victory: the rival won, then the next one. */
function stampPhaseOf(order: number, sequence: VictorySequence | null): StampPhase | null {
  if (!sequence) return null;
  if (order === sequence.order)
    return sequence.phase === "release" || sequence.phase === "postmark" || sequence.phase === "stars"
      ? sequence.phase
      : null;
  if (order === sequence.order + 1)
    return sequence.phase === "unlock" || sequence.phase === "arrive" ? sequence.phase : null;
  return null;
}

/** The small mark printed along the tape, in the colour of the stretch it is on. */
function PathMarkShape({ mark }: { mark: PathMark }) {
  const color = mark.isWalked ? "#a93c2b" : "#8d877c";
  return (
    <g transform={`translate(${mark.x} ${mark.y}) rotate(${mark.angle})`} opacity={mark.isWalked ? 0.95 : 0.6}>
      {mark.kind === "arrow" && (
        <path
          d="M-4 -6L3 0L-4 6"
          fill="none"
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {mark.kind === "star" && <path d={PATH_MARKS.star} fill={color} opacity=".85" />}
      {mark.kind === "pawn" && (
        <g transform="rotate(90) scale(.42) translate(0 22)">
          <path d={PATH_MARKS.pawn} fill={color} />
        </g>
      )}
      {mark.kind === "knight" && (
        <g transform="rotate(90) scale(.17) translate(0 50)">
          <path d={PATH_MARKS.knight} fill={color} />
        </g>
      )}
    </g>
  );
}

interface SewingProps {
  layout: AdventureLayout;
  /** The path to sew, as SVG path data. */
  path: string;
  /** The marks printed on it, which are brick: it is walked. */
  marks: readonly PathMark[];
  /** The arc length of the whole path at which this one starts: the stitches keep their phase from there. */
  startLength?: number;
}

/**
 * A stretch of the path that is sewn: the tape in its cream with its printed
 * squares, the brick marks, and the seam over it with its shadow, its thread
 * and its highlight. The walked part of the map is one, and the stretch the
 * victory sews to the next rival is another (under a mask that uncovers it).
 */
function Sewing({ layout, path, marks, startLength = 0 }: SewingProps) {
  const tape = layout.seam.tape;
  const square = layout.seam.stitch;
  const thread = round(-(startLength % 20));
  return (
    <>
      <path d={path} fill="none" stroke="#f5ead2" strokeWidth={tape} />
      <path
        d={path}
        fill="none"
        stroke="#dcbf86"
        strokeWidth={tape}
        strokeDasharray={`${square} ${square}`}
        strokeDashoffset={round(-(startLength % (square * 2)))}
      />
      {marks.map((mark) => (
        <PathMarkShape key={`${mark.x}-${mark.y}`} mark={mark} />
      ))}
      <path
        d={path}
        fill="none"
        stroke="rgba(60,20,10,.35)"
        strokeWidth="3.2"
        strokeDasharray="12 8"
        strokeDashoffset={thread}
        strokeLinecap="round"
        transform="translate(.8 1.4)"
      />
      <path
        className="map-layer__thread"
        d={path}
        fill="none"
        strokeWidth="3.2"
        strokeDasharray="12 8"
        strokeDashoffset={thread}
        strokeLinecap="round"
      />
      <path
        d={path}
        fill="none"
        stroke="#e0796a"
        strokeWidth="1"
        strokeDasharray="7 13"
        strokeDashoffset={thread - 2}
        strokeLinecap="round"
        opacity=".85"
      />
    </>
  );
}

/**
 * One layout of the map: the adventure's static scenery and, over it, the
 * live layer drawn from data — the seam sewn up to the rival to play and the
 * rest of the path in pencil, the needle, the pencil notes and the «¡me
 * toca!», the pages of the notebook, the keepsakes stuck down, the twelve
 * stamps and the person's token. Everything is placed in the art's own units
 * as a percentage of the world's box, and measured in `--u` (one art unit as a
 * length), so the whole layer scales with the window. The three layouts are all
 * in the page and the stylesheet shows the one that fits.
 */
export function MapLayer({ size, layout, zones, progress, player, sequence, onOpen }: MapLayerProps) {
  const { width, height } = layout;
  const x = (value: number) => round((value / width) * 100);
  const y = (value: number) => round((value / height) * 100);

  const current = progress.current;
  const currentOrder = current?.order ?? null;
  const seam = useMemo(() => seamOf(layout, currentOrder), [layout, currentOrder]);
  const reachedZone = current ? zones.findIndex((zone) => zone.slug === current.zone) : zones.length - 1;
  const stopOf = (order: number) => layout.path.find((stop) => stop[2] === order)!;
  const focusOrder = currentOrder ?? progress.total;

  // The victory: the stretch to sew to the next rival, and what stays where it was until each step is done.
  const phase = sequence?.phase ?? "done";
  const wonOrder = sequence?.order ?? null;
  const hasNext = sequence?.hasNext ?? false;
  const travel = useMemo(
    () => (wonOrder !== null && hasNext ? travelOf(layout, wonOrder, wonOrder + 1) : null),
    [layout, wonOrder, hasNext],
  );
  const isSewing = travel !== null && inPhases(phase, "seam", "arrive");
  // The token stays on the rival beaten until it hops to the next one.
  const tokenOrder = sequence && travel && !inPhases(phase, "done") ? sequence.order : focusOrder;
  const tokenOffset = layout.token.byOrder[tokenOrder] ?? layout.token.offset;
  const tokenStop = stopOf(tokenOrder);
  // The «¡me toca!» belongs to the rival to play: it leaves with the pin and comes back at the end.
  const hintOrder = !sequence
    ? currentOrder
    : inPhases(phase, "done")
      ? currentOrder
      : inPhases(phase, "rest", "postmark")
        ? sequence.order
        : null;
  const hint = hintOrder === null ? null : layout.hints[hintOrder];
  const start = layout.path[0]!;

  const maskId = useId();
  const worldRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<SVGPathElement>(null);
  const needleRef = useRef<SVGGElement>(null);
  const needleThreadRef = useRef<SVGPathElement>(null);
  const tokenRef = useRef<HTMLSpanElement>(null);
  useSeamTravel({ phase, travel, layout, worldRef, maskRef, needleRef, needleThreadRef });
  useTokenTravel({ phase, travel, layout, order: sequence?.order ?? null, worldRef, tokenRef });

  return (
    <section
      className={`map-layer map-layer_size_${size}`}
      data-size={size}
      style={{ "--art-width": width, "--art-height": height } as CSSProperties}
      aria-label={`Mapa de ${progress.title}`}
    >
      <div ref={worldRef} className="map-layer__world">
        <Image
          className="map-layer__scenery"
          src={`/aventuras/${progress.slug}/${SCENERY_FILE[size]}.svg`}
          alt=""
          width={width + BLEED_X * 2}
          height={height + BLEED_TOP}
          style={{
            left: `${round((-BLEED_X / width) * 100)}%`,
            top: `${round((-BLEED_TOP / height) * 100)}%`,
            width: `${round(((width + BLEED_X * 2) / width) * 100)}%`,
          }}
          sizes="100vw"
          draggable={false}
        />
        <span className="map-layer__wash" aria-hidden="true" />

        <svg className="map-layer__seam" viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
          {/* The stretch walked, sewn; then the marks still in grey and the rest of the path in pencil. */}
          <Sewing layout={layout} path={seam.walked} marks={seam.marks.filter((mark) => mark.isWalked)} />
          {seam.marks
            .filter((mark) => !mark.isWalked)
            .map((mark) => (
              <PathMarkShape key={`${mark.x}-${mark.y}`} mark={mark} />
            ))}
          <path
            className="map-layer__pencil"
            d={seam.ahead}
            fill="none"
            strokeWidth="1.6"
            strokeDasharray="3 7"
            strokeLinecap="round"
            opacity=".7"
          />

          {/* The victory sews the stretch to the next rival, uncovered by a mask that runs along it. */}
          {isSewing && travel && (
            <>
              <mask
                id={maskId}
                maskUnits="userSpaceOnUse"
                x={travel.box.x}
                y={travel.box.y}
                width={travel.box.width}
                height={travel.box.height}
              >
                <path
                  ref={maskRef}
                  d={travel.path}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={layout.seam.tape + 16}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray="1 1"
                  strokeDashoffset={phase === "seam" ? 1 : 0}
                />
              </mask>
              <g mask={`url(#${maskId})`}>
                <Sewing layout={layout} path={travel.path} marks={travel.marks} startLength={travel.startLength} />
              </g>
            </>
          )}

          <circle className="map-layer__thread-dot" cx={start[0]} cy={start[1]} r="6" />
          <path
            className="map-layer__thread"
            d={`M${start[0]} ${start[1]}q-14 10 -8 24`}
            fill="none"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* The needle that leads the seam, still threaded. */}
          <path
            ref={needleThreadRef}
            className="map-layer__thread"
            d={seam.needle.thread}
            fill="none"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <g
            ref={needleRef}
            transform={`translate(${seam.needle.x} ${seam.needle.y}) rotate(${seam.needle.rotation}) scale(${seam.needle.scale})`}
          >
            <Needle />
          </g>

          {layout.notes.map((note) => {
            const lines = note.text.split("\n");
            const lineHeight = (note.size ?? 26) * 1.02;
            return (
              <g key={note.text} className={`map-layer__note${note.isLight ? " map-layer__note_tone_light" : ""}`}>
                <text
                  x={note.x}
                  y={note.y}
                  fontSize={note.size ?? 26}
                  textAnchor="middle"
                  transform={`rotate(${note.rotation} ${note.x} ${note.y})`}
                >
                  {lines.map((line, index) => (
                    <tspan key={line} x={note.x} dy={index === 0 ? 0 : lineHeight}>
                      {line}
                    </tspan>
                  ))}
                </text>
                <path
                  d={arrowPath(note.arrow, 10)}
                  fill="none"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {hint && (
            <g
              className={`map-layer__hint${zoneAt(layout, hint.y).isNight ? " map-layer__hint_tone_light" : ""}${
                sequence && phase === "release" ? " map-layer__hint_phase_leaving" : ""
              }${sequence && phase === "done" ? " map-layer__hint_phase_arriving" : ""}`}
            >
              <text
                x={hint.x}
                y={hint.y}
                fontSize="29"
                textAnchor="middle"
                transform={`rotate(${hint.rotation} ${hint.x} ${hint.y})`}
              >
                ¡me toca!
              </text>
              <path
                d={arrowPath(hint.arrow, 11)}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}
        </svg>

        <div className="map-layer__live">
          {zones.map((zone, index) => {
            const page = layout.pages[zone.slug];
            return (
              <div key={zone.slug} className="map-layer__zone">
                {page ? (
                  <NotePage
                    zone={zone}
                    number={index + 1}
                    isReached={index <= reachedZone}
                    isCompact={size === "mobile"}
                    position={{ left: x(page[0]), top: y(page[1]), width: x(page[3]), rotation: page[2] }}
                  />
                ) : (
                  <h2 className="map-layer__zone-name">{zone.name}</h2>
                )}
                {progress.encounters
                  .filter((encounter) => encounter.zone === zone.slug)
                  .map((encounter) => {
                    const stop = stopOf(encounter.order);
                    const keepsake = layout.keepsakes[encounter.order];
                    const stampWidth = encounter.isFinal
                      ? layout.stamp.final
                      : encounter.state === "available"
                        ? layout.stamp.available
                        : layout.stamp.size;
                    return (
                      <div key={encounter.order} className="map-layer__encounter">
                        {encounter.state === "beaten" &&
                          keepsake &&
                          !(sequence?.order === encounter.order && !inPhases(phase, "keepsake")) && (
                            <Keepsake
                              isSticking={sequence?.order === encounter.order && phase === "keepsake"}
                              adventure={progress.slug}
                              order={encounter.order}
                              playerName={player.name}
                              position={{
                                left: x(keepsake[0]),
                                top: y(keepsake[1]),
                                width: x(keepsake[3]),
                                rotation: keepsake[2],
                              }}
                            />
                          )}
                        <EncounterStamp
                          encounter={encounter}
                          adventure={progress.slug}
                          total={progress.total}
                          postmark={zone.postmark}
                          position={{
                            left: x(stop[0]),
                            top: y(stop[1]),
                            width: x(stampWidth),
                            tilt: layout.tilt[encounter.order] ?? 0,
                          }}
                          isFocus={encounter.order === focusOrder}
                          phase={stampPhaseOf(encounter.order, sequence)}
                          onOpen={onOpen}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}

          <span
            className="map-layer__flag"
            style={{ left: `${x(layout.start.x)}%`, top: `${y(layout.start.y)}%` }}
            aria-hidden="true"
          >
            Salida
          </span>

          <span
            ref={tokenRef}
            className={`map-layer__token${sequence && phase === "token" ? " map-layer__token_phase_hop" : ""}`}
            style={{
              left: `${x(tokenStop[0] + tokenOffset[0])}%`,
              top: `${y(tokenStop[1] + tokenOffset[1])}%`,
              width: `${x(70)}%`,
            }}
            aria-hidden="true"
          >
            <svg viewBox="-30 -84 60 94" focusable="false">
              <PlayerToken initials={player.initials} />
            </svg>
          </span>
        </div>
      </div>
    </section>
  );
}
