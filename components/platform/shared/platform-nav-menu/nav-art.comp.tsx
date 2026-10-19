import { useId } from "react";
import type { PlatformNavArt } from "@/constants/platform/nav-items.const";

interface NavArtProps {
  art: PlatformNavArt;
  className?: string;
}

/** The puzzle piece's outline, in its own 240-unit square: a tab out on top and on the right, a notch in below and on the left. */
const PIECE =
  "M40 40 H100 C104 40 106 36 104 32 C98 20 104 6 120 6 C136 6 142 20 136 32 C134 36 136 40 140 40 H200 V100 C200 104 204 106 208 104 C220 98 234 104 234 120 C234 136 220 142 208 136 C204 134 200 136 200 140 V200 H140 C136 200 134 196 136 192 C142 180 136 166 120 166 C104 166 98 180 104 192 C106 196 104 200 100 200 H40 V140 C40 136 44 134 48 136 C60 142 74 136 74 120 C74 104 60 98 48 104 C44 106 40 104 40 100 Z";

/** «Jugar»: a red pawn on the middle square of a three-by-three board. */
function PlayArt() {
  return (
    <>
      <path d="M20 130 L120 172 L120 188 L20 146 Z" fill="#8f6a45" />
      <path d="M120 172 L220 130 L220 146 L120 188 Z" fill="#a57c52" />
      <g transform="matrix(33.333 -14 33.333 14 20 130)">
        <rect width="3" height="3" fill="#f4e8d2" />
        <path d="M0 0h1v1h-1z M2 0h1v1h-1z M1 1h1v1h-1z M0 2h1v1h-1z M2 2h1v1h-1z" fill="#d2a46f" />
      </g>
      <path
        d="M20 130 L120 88 L220 130 L120 172 Z"
        fill="none"
        stroke="#fffaf0"
        strokeOpacity="0.75"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <ellipse cx="120" cy="134" rx="32" ry="12" fill="#5a3d22" opacity="0.3" />
      <g transform="translate(120 132)">
        <path
          d="M-30 0 C-30 -12 -22 -18 -14 -20 C-10 -32 -8 -44 -8 -54 H8 C8 -44 10 -32 14 -20 C22 -18 30 -12 30 0 Z"
          fill="#a81e22"
        />
        <rect x="-18" y="-62" width="36" height="10" rx="5" fill="#a81e22" />
        <circle cx="0" cy="-80" r="19" fill="#a81e22" />
        <path
          d="M0 -54 H8 C8 -44 10 -32 14 -20 C22 -18 30 -12 30 0 H0 Z M0 -62 H13 a5 5 0 0 1 0 10 H0 Z M0 -99 a19 19 0 0 1 0 38 Z"
          fill="#7e1619"
          opacity="0.55"
        />
        <path
          d="M-20 -4 C-20 -12 -14 -16 -8 -17"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.22"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="-7" cy="-87" r="5" fill="#ffffff" opacity="0.25" />
      </g>
    </>
  );
}

/** «Ejercicios»: a puzzle piece cut from a chessboard, with a pawn on it. */
function ExercisesArt({ clipId }: { clipId: string }) {
  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <path d={PIECE} />
        </clipPath>
      </defs>
      <g transform="rotate(-8 120 120)">
        <path d={PIECE} fill="#8f6a45" transform="translate(0 16)" />
        <path d={PIECE} fill="#f4e8d2" />
        <path
          clipPath={`url(#${clipId})`}
          fill="#d2a46f"
          d="M40 40h40v40h-40z M120 40h40v40h-40z M80 80h40v40h-40z M160 80h40v40h-40z M40 120h40v40h-40z M120 120h40v40h-40z M80 160h40v40h-40z M160 160h40v40h-40z M80 0h40v40h-40z M200 120h40v40h-40z"
        />
        <path d={PIECE} fill="none" stroke="#fffaf0" strokeOpacity="0.8" strokeWidth="4" />
        <g transform="translate(140 136) scale(1.25)" fill="#16110d">
          <path d="M-15 16 C-15 11 -12 9 -9 8 C-7 3 -5 -2 -5 -6 H5 C5 -2 7 3 9 8 C12 9 15 11 15 16 Z" />
          <rect x="-9" y="-9" width="18" height="5" rx="2.5" />
          <circle cx="0" cy="-16" r="8" />
        </g>
      </g>
    </>
  );
}

/** «Aprender»: a mortarboard whose top is a chessboard, with its red tassel. */
function LearnArt() {
  return (
    <g transform="rotate(-6 170 130)">
      <path d="M110 118 V168 C110 196 230 196 230 168 V118 Z" fill="#2a2420" />
      <path d="M110 160 C110 186 230 186 230 160 V168 C230 196 110 196 110 168 Z" fill="#000000" opacity="0.3" />
      <path d="M50 100 L170 150 L170 164 L50 114 Z" fill="#8f6a45" />
      <path d="M170 150 L290 100 L290 114 L170 164 Z" fill="#a57c52" />
      <g transform="matrix(30 -12.5 30 12.5 50 100)">
        <rect width="4" height="4" fill="#f4e8d2" />
        <path
          d="M0 0h1v1h-1z M2 0h1v1h-1z M1 1h1v1h-1z M3 1h1v1h-1z M0 2h1v1h-1z M2 2h1v1h-1z M1 3h1v1h-1z M3 3h1v1h-1z"
          fill="#d2a46f"
        />
      </g>
      <path
        d="M50 100 L170 50 L290 100 L170 150 Z"
        fill="none"
        stroke="#fffaf0"
        strokeOpacity="0.8"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M170 100 C210 104 262 98 284 106 C290 110 291 130 291 160"
        fill="none"
        stroke="#a81e22"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="170" cy="100" r="9" fill="#a81e22" />
      <path d="M282 160 H300 L306 204 C297 209 285 209 276 204 Z" fill="#a81e22" />
    </g>
  );
}

/** «Herramientas»: a closed red toolbox with a chessboard plate on its front. */
function ToolsArt() {
  return (
    <g transform="rotate(-3 176 150)">
      <path d="M150 90 C150 52 218 52 218 90" fill="none" stroke="#16110d" strokeWidth="13" strokeLinecap="round" />
      <path d="M78 98 L110 80 H274 L242 98 Z" fill="#cf3a3e" />
      <path d="M242 98 L274 80 L282 112 L250 130 Z" fill="#8f1a1e" />
      <path d="M78 98 H242 L250 130 H70 Z" fill="#bb2a2e" />
      <path d="M250 133 L282 115 V197 L250 215 Z" fill="#7e1619" />
      <rect x="70" y="133" width="180" height="82" fill="#a81e22" />
      <path d="M70 131.5 H250 L282 113.5" stroke="#4a0c0e" strokeWidth="4" fill="none" />
      <rect x="86" y="116" width="24" height="32" rx="5" fill="#c3c8cd" />
      <rect x="210" y="116" width="24" height="32" rx="5" fill="#c3c8cd" />
      <rect x="126" y="153" width="68" height="44" rx="5" fill="#fbf4e6" />
      <path d="M134 160h13v15h-13z M160 160h13v15h-13z M147 175h13v15h-13z M173 175h13v15h-13z" fill="#d2a46f" />
    </g>
  );
}

/** «Enseñar»: the wall board of a chess class on its easel, a pawn and the red arrow of the move. */
function TeachArt() {
  return (
    <>
      <path d="M120 156 L120 214" stroke="#5a3d22" strokeWidth="9" strokeLinecap="round" />
      <path d="M98 156 L72 214 M142 156 L168 214" stroke="#8f6a45" strokeWidth="10" strokeLinecap="round" />
      <path d="M84 188 H156" stroke="#a57c52" strokeWidth="7" strokeLinecap="round" />
      <g transform="rotate(-3 120 90)">
        <rect x="54" y="20" width="132" height="132" rx="8" fill="#8f6a45" />
        <rect x="62" y="28" width="116" height="116" fill="#f4e8d2" />
        <path
          d="M91 28h29v29h-29z M149 28h29v29h-29z M62 57h29v29h-29z M120 57h29v29h-29z M91 86h29v29h-29z M149 86h29v29h-29z M62 115h29v29h-29z M120 115h29v29h-29z"
          fill="#d2a46f"
        />
        <g transform="translate(76.5 134) scale(0.8)" fill="#16110d">
          <path d="M-15 16 C-15 11 -12 9 -9 8 C-7 3 -5 -2 -5 -6 H5 C5 -2 7 3 9 8 C12 9 15 11 15 16 Z" />
          <rect x="-9" y="-9" width="18" height="5" rx="2.5" />
          <circle cx="0" cy="-16" r="8" />
        </g>
        <path d="M84 116 L126 80" stroke="#a81e22" strokeWidth="8" strokeLinecap="round" />
        <path d="M134.5 71.5 L129.6 89.2 L116.8 76.4 Z" fill="#a81e22" />
      </g>
      <rect x="46" y="150" width="148" height="9" rx="3" fill="#a57c52" />
    </>
  );
}

/** «Material»: a stack of books with a diagram card laid on top. */
function MaterialArt() {
  return (
    <>
      <rect x="34" y="150" width="176" height="34" rx="5" fill="#2a2420" />
      <rect x="60" y="162" width="40" height="10" rx="2" fill="#d2a46f" />
      <rect x="50" y="118" width="156" height="32" rx="5" fill="#a81e22" />
      <rect x="150" y="128" width="36" height="8" rx="2" fill="#f4e8d2" />
      <rect x="42" y="90" width="150" height="28" rx="5" fill="#a57c52" />
      <rect x="62" y="99" width="30" height="8" rx="2" fill="#f4e8d2" />
      <g transform="rotate(-10 128 64)">
        <rect x="80" y="40" width="96" height="60" rx="4" fill="#000000" opacity="0.15" />
        <rect x="80" y="34" width="96" height="60" rx="4" fill="#fbf4e6" />
        <rect x="92" y="46" width="72" height="36" fill="#f4e8d2" />
        <path
          d="M104 46h12v12h-12z M128 46h12v12h-12z M152 46h12v12h-12z M92 58h12v12h-12z M116 58h12v12h-12z M140 58h12v12h-12z M104 70h12v12h-12z M128 70h12v12h-12z M152 70h12v12h-12z"
          fill="#d2a46f"
        />
        <path d="M104 76 L146 54" stroke="#a81e22" strokeWidth="4" strokeLinecap="round" />
        <path d="M152 51 L144 60 L141 53 Z" fill="#a81e22" />
      </g>
    </>
  );
}

/** Each drawing's frame: cut close to what it draws, so it fills its slot. */
const VIEW_BOXES: Record<PlatformNavArt, string> = {
  play: "14 26 212 168",
  exercises: "28 -4 222 234",
  learn: "40 36 270 176",
  tools: "62 44 228 180",
  teach: "40 12 160 210",
  material: "26 20 192 172",
};

/**
 * The drawing of an entry of the menu bar (2026-10-18; the teacher's «Enseñar»
 * and «Material» since 2026-10-19): illustrations, not
 * icons, so they keep their own colours in both themes (the board's cream
 * and wood, the accent's red) instead of reading `currentColor`. They are
 * decoration: the entry's name is its label, so the drawing is hidden from
 * assistive technology.
 */
export function NavArt({ art, className }: NavArtProps) {
  // The puzzle piece's clip is referenced by id; a page draws the menu once,
  // but a story may draw it twice, so the id is generated.
  const clipId = `nav-art-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  return (
    <svg className={className} viewBox={VIEW_BOXES[art]} aria-hidden="true" focusable="false">
      {art === "play" && <PlayArt />}
      {art === "exercises" && <ExercisesArt clipId={clipId} />}
      {art === "learn" && <LearnArt />}
      {art === "tools" && <ToolsArt />}
      {art === "teach" && <TeachArt />}
      {art === "material" && <MaterialArt />}
    </svg>
  );
}
