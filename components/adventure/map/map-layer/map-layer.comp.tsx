import Image from "next/image";
import { useMemo, type CSSProperties } from "react";
import { Keepsake } from "@/components/adventure/keepsakes/keepsake/keepsake.comp";
import { Needle } from "@/components/adventure/map/needle.comp";
import { PATH_MARKS } from "@/components/adventure/map/path-marks.const";
import { PlayerToken } from "@/components/adventure/map/player-token.comp";
import { NotePage } from "@/components/adventure/note-page/note-page/note-page.comp";
import { EncounterStamp } from "@/components/adventure/stamp/encounter-stamp/encounter-stamp.comp";
import type { AdventureLayout, AdventureZoneSeed } from "@/lib/adventure/adventure.types";
import { arrowPath, seamOf, zoneAt, type PathMark } from "@/lib/adventure/map-geometry";
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
  /** A stamp was pressed: the host opens that rival's card. */
  onOpen: (order: number, trigger: HTMLElement) => void;
}

const round = (value: number) => Math.round(value * 1000) / 1000;

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
export function MapLayer({ size, layout, zones, progress, player, onOpen }: MapLayerProps) {
  const { width, height } = layout;
  const x = (value: number) => round((value / width) * 100);
  const y = (value: number) => round((value / height) * 100);

  const current = progress.current;
  const currentOrder = current?.order ?? null;
  const seam = useMemo(() => seamOf(layout, currentOrder), [layout, currentOrder]);
  const reachedZone = current ? zones.findIndex((zone) => zone.slug === current.zone) : zones.length - 1;
  const stopOf = (order: number) => layout.path.find((stop) => stop[2] === order)!;
  const focusOrder = currentOrder ?? progress.total;
  const tokenOrder = focusOrder;
  const tokenOffset = layout.token.byOrder[tokenOrder] ?? layout.token.offset;
  const tokenStop = stopOf(tokenOrder);
  const hint = currentOrder === null ? null : layout.hints[currentOrder];
  const start = layout.path[0]!;

  return (
    <section
      className={`map-layer map-layer_size_${size}`}
      data-size={size}
      style={{ "--art-width": width, "--art-height": height } as CSSProperties}
      aria-label={`Mapa de ${progress.title}`}
    >
      <div className="map-layer__world">
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
          {/* The stretch walked: the tape in its cream with the printed squares, the marks in brick. */}
          <path d={seam.walked} fill="none" stroke="#f5ead2" strokeWidth={layout.seam.tape} />
          <path
            d={seam.walked}
            fill="none"
            stroke="#dcbf86"
            strokeWidth={layout.seam.tape}
            strokeDasharray={`${layout.seam.stitch} ${layout.seam.stitch}`}
          />
          {seam.marks
            .filter((mark) => mark.isWalked)
            .map((mark) => (
              <PathMarkShape key={`${mark.x}-${mark.y}`} mark={mark} />
            ))}
          {seam.marks
            .filter((mark) => !mark.isWalked)
            .map((mark) => (
              <PathMarkShape key={`${mark.x}-${mark.y}`} mark={mark} />
            ))}

          {/* The seam over what is walked, the pencil over what is not. */}
          <path
            d={seam.walked}
            fill="none"
            stroke="rgba(60,20,10,.35)"
            strokeWidth="3.2"
            strokeDasharray="12 8"
            strokeLinecap="round"
            transform="translate(.8 1.4)"
          />
          <path
            className="map-layer__thread"
            d={seam.walked}
            fill="none"
            strokeWidth="3.2"
            strokeDasharray="12 8"
            strokeLinecap="round"
          />
          <path
            d={seam.walked}
            fill="none"
            stroke="#e0796a"
            strokeWidth="1"
            strokeDasharray="7 13"
            strokeDashoffset="-2"
            strokeLinecap="round"
            opacity=".85"
          />
          <path
            className="map-layer__pencil"
            d={seam.ahead}
            fill="none"
            strokeWidth="1.6"
            strokeDasharray="3 7"
            strokeLinecap="round"
            opacity=".7"
          />

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
            className="map-layer__thread"
            d={seam.needle.thread}
            fill="none"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <g
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
            <g className={`map-layer__hint${zoneAt(layout, hint.y).isNight ? " map-layer__hint_tone_light" : ""}`}>
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
                        {encounter.state === "beaten" && keepsake && (
                          <Keepsake
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
            className="map-layer__token"
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
