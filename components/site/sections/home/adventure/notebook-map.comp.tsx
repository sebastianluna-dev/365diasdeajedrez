import type { CSSProperties } from "react";
import { ProfeLealPortrait } from "@/components/adventure/portraits/profe-leal-portrait.comp";
import { TonitoGarzaPortrait } from "@/components/adventure/portraits/tonito-garza-portrait.comp";
import type { HomeAdventureCopy } from "@/types/academy-home.types";
import { MAP, MAP_HEIGHT, MAP_WIDTH } from "./notebook-map.const";
import "./notebook-map.comp.css";

interface NotebookMapProps {
  map: HomeAdventureCopy["map"];
}

const STAR = "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z";
const BACKGROUND = {
  backgroundSize: MAP.background.size,
  backgroundPosition: MAP.background.position,
} as CSSProperties;

/**
 * The notebook's map at the Club La Torre, as the adventure draws it: the
 * scenery is the adventure's exported art (a CSS background, cropped), and
 * over it, in one SVG that scales with the window, the seam walked so far and
 * still to sew, the torn page with its pencil note, the keepsake, Profe Leal's
 * stamp with its three stars, Toñito Garza's stamp (the next one) with «¡me
 * toca!» and the player's token. An illustration with its own colours, the
 * adventure's: one picture with its name, as the adventure's own map is.
 */
export function NotebookMap({ map }: NotebookMapProps) {
  const { leal, tono, keepsake, page, stars, token, hint, note, seam } = MAP;

  return (
    <div className="home-notebook" role="img" aria-label={map.label} style={BACKGROUND}>
      <svg className="home-notebook__layer" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}>
        <path className="home-notebook__tape" d={seam.ahead} strokeWidth={seam.tape} />
        <path className="home-notebook__stitch-ahead" d={seam.ahead} />
        <path
          className="home-notebook__tape home-notebook__tape_state_walked"
          d={seam.walked}
          strokeWidth={seam.tape}
        />
        <path className="home-notebook__stitch" d={seam.walked} />
        <path className="home-notebook__arrow" d={MAP.hintArrow.line} />
        <path className="home-notebook__arrow" d={MAP.hintArrow.head} />
        <path className="home-notebook__arrow" d={MAP.noteArrow.line} />
        <path className="home-notebook__arrow" d={MAP.noteArrow.head} />

        <foreignObject
          x={page.x}
          y={page.y}
          width={page.w}
          height={page.h}
          transform={`rotate(${page.rotate} ${page.cx} ${page.cy})`}
        >
          <div className="home-notebook__page">
            <span className="home-notebook__page-kicker">{map.page.kicker}</span>
            <span className="home-notebook__page-title">{map.page.title}</span>
            <span className="home-notebook__page-text">{map.page.text}</span>
          </div>
        </foreignObject>
        <foreignObject
          x={note.cx - 110}
          y={note.cy - 16}
          width={220}
          height={32}
          transform={`rotate(3 ${note.cx} ${note.cy})`}
        >
          <div className="home-notebook__pencil-box">
            <span className="home-notebook__pencil">{map.note}</span>
          </div>
        </foreignObject>

        <foreignObject
          x={keepsake.x}
          y={keepsake.y}
          width={keepsake.w}
          height={keepsake.h}
          transform={`rotate(${keepsake.rotate} ${keepsake.cx} ${keepsake.cy})`}
        >
          <div className="home-notebook__keepsake">
            <i className="home-notebook__keepsake-photo" />
            <span className="home-notebook__keepsake-lines">
              <b className="home-notebook__keepsake-title">{map.keepsake}</b>
              <em className="home-notebook__keepsake-line" />
              <em className="home-notebook__keepsake-line home-notebook__keepsake-line_size_short" />
            </span>
          </div>
        </foreignObject>

        <g transform={`rotate(${leal.rotate} ${leal.cx} ${leal.cy})`}>
          <rect
            className="home-notebook__stamp home-notebook__stamp_state_won"
            x={leal.x}
            y={leal.y}
            width={leal.w}
            height={leal.h}
            rx="8"
          />
          <svg x={leal.x + 6} y={leal.y + 6} width={leal.w - 12} height={leal.h - 12} viewBox="0 6 100 100">
            <ProfeLealPortrait />
          </svg>
          <circle className="home-notebook__post" cx={leal.x + leal.w + 3} cy={leal.y - 3} r="14" />
          <path className="home-notebook__post-check" d={`M${leal.x + leal.w - 3} ${leal.y - 3} l4 4 l8 -8`} />
        </g>
        <g transform={`translate(${stars.x} ${stars.y})`}>
          <rect className="home-notebook__stars" x="0" y="0" width="64" height="22" rx="11" />
          {[0, 1, 2].map((index) => (
            <path
              key={index}
              className="home-notebook__star"
              d={STAR}
              transform={`translate(${6 + index * 18} 3) scale(0.68)`}
            />
          ))}
        </g>

        <g transform={`rotate(${tono.rotate} ${tono.cx} ${tono.cy})`}>
          <rect
            className="home-notebook__stamp home-notebook__stamp_state_next"
            x={tono.x}
            y={tono.y}
            width={tono.w}
            height={tono.h}
            rx="8"
          />
          <svg x={tono.x + 4} y={tono.y + 4} width={tono.w - 8} height={tono.h - 8} viewBox="0 6 100 100">
            <TonitoGarzaPortrait />
          </svg>
        </g>
        <foreignObject
          x={hint.cx - 70}
          y={hint.cy - 18}
          width={140}
          height={36}
          transform={`rotate(-2 ${hint.cx} ${hint.cy})`}
        >
          <div className="home-notebook__pencil-box">
            <span className="home-notebook__pencil home-notebook__pencil_tone_red">{map.hint}</span>
          </div>
        </foreignObject>

        <g className="home-notebook__token" transform={`translate(${token.x} ${token.y})`}>
          <path d="M-14 0 C-14 -6 -10 -9 -6 -10 C-4 -16 -3 -22 -3 -26 H3 C3 -22 4 -16 6 -10 C10 -9 14 -6 14 0 Z" />
          <rect x="-8" y="-31" width="16" height="5" rx="2.5" />
          <circle cx="0" cy="-38" r="8" />
        </g>
      </svg>

      <span className="home-notebook__hud">
        <span className="home-notebook__chip home-notebook__chip_kind_title">{map.hud.title}</span>
        <span className="home-notebook__chip">{map.hud.rivals}</span>
        <span className="home-notebook__chip">
          <svg className="home-notebook__chip-star" viewBox="0 0 24 24">
            <path d={STAR} />
          </svg>
          {map.hud.stars}
        </span>
      </span>
    </div>
  );
}
