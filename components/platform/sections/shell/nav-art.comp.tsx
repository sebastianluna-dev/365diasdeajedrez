import { useId } from "react";
import type { PlatformNavArt } from "@/constants/platform/nav-items.const";
import "./nav-art.comp.css";

interface NavArtProps {
  art: PlatformNavArt;
  className?: string;
}

/** The puzzle piece's outline, in its own 240-unit square: a tab out on top and on the right, a notch in below and on the left. */
const PIECE =
  "M40 40 H100 C104 40 106 36 104 32 C98 20 104 6 120 6 C136 6 142 20 136 32 C134 36 136 40 140 40 H200 V100 C200 104 204 106 208 104 C220 98 234 104 234 120 C234 136 220 142 208 136 C204 134 200 136 200 140 V200 H140 C136 200 134 196 136 192 C142 180 136 166 120 166 C104 166 98 180 104 192 C106 196 104 200 100 200 H40 V140 C40 136 44 134 48 136 C60 142 74 136 74 120 C74 104 60 98 48 104 C44 106 40 104 40 100 Z";

/** A pawn standing on its base at (0, 0), 40 units tall: drawn translated and scaled where a drawing needs one. */
function Pawn({ transform, fill }: { transform: string; fill: string }) {
  return (
    <g transform={transform} fill={fill}>
      <path d="M-15 0 C-15 -5 -12 -7 -9 -8 C-7 -13 -5 -18 -5 -22 H5 C5 -18 7 -13 9 -8 C12 -7 15 -5 15 0 Z" />
      <rect x="-9" y="-25" width="18" height="5" rx="2.5" />
      <circle cx="0" cy="-32" r="8" />
    </g>
  );
}

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
      <g className="nav-art__move">
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
        <g className="nav-art__move">
          <Pawn transform="translate(140 156) scale(1.25)" fill="#16110d" />
        </g>
      </g>
    </>
  );
}

/** «Puzzle Rush»: a stopwatch with the red slice of the time gone. */
function RushArt() {
  return (
    <>
      <rect x="108" y="44" width="24" height="16" rx="4" fill="#2a2420" />
      <rect x="114" y="56" width="12" height="16" fill="#2a2420" />
      <rect x="160" y="70" width="16" height="10" rx="3" fill="#2a2420" transform="rotate(40 168 75)" />
      <circle cx="120" cy="134" r="62" fill="#2a2420" />
      <circle cx="120" cy="134" r="52" fill="#fbf4e6" />
      <path d="M120 134 L120 82 A52 52 0 0 1 165 108 Z" fill="#a81e22" />
      <g className="nav-art__move">
        <path d="M120 134 L148 104" stroke="#16110d" strokeWidth="7" strokeLinecap="round" />
      </g>
      <circle cx="120" cy="134" r="7" fill="#16110d" />
    </>
  );
}

/** «Aprender», now «Cursos»: a mortarboard whose top is a chessboard, with its red tassel. */
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
      <g className="nav-art__move">
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
    </g>
  );
}

/** «Estudiar»: an open book with a diagram on the right page and its red ribbon. */
function StudiesArt() {
  return (
    <>
      <path
        d="M36 78 V182 C64 174 96 176 120 190 C144 176 176 174 204 182 V78"
        fill="none"
        stroke="#a81e22"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path d="M120 80 C96 66 64 64 40 72 V176 C64 168 96 170 120 184 Z" fill="#fbf4e6" />
      <path d="M120 80 C144 66 176 64 200 72 V176 C176 168 144 170 120 184 Z" fill="#f4e8d2" />
      <path d="M120 80 V184" stroke="#d2a46f" strokeWidth="2" />
      <rect x="58" y="96" width="44" height="6" rx="3" fill="#d2a46f" />
      <rect x="58" y="112" width="38" height="6" rx="3" fill="#d2a46f" />
      <rect x="58" y="128" width="44" height="6" rx="3" fill="#d2a46f" />
      <rect x="58" y="144" width="30" height="6" rx="3" fill="#d2a46f" />
      <rect x="140" y="94" width="44" height="44" fill="#fbf4e6" />
      <path
        d="M154.7 94h14.7v14.7h-14.7z M140 108.7h14.7v14.7h-14.7z M169.3 108.7h14.7v14.7h-14.7z M154.7 123.3h14.7v14.7h-14.7z"
        fill="#d2a46f"
      />
      <g className="nav-art__move">
        <path d="M164 176 V208 l8 -8 8 8 V172" fill="#a81e22" />
      </g>
    </>
  );
}

/** «Enseñar», now the classes: the wall board of a chess class on its easel, a pawn and the red arrow of the move. */
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
        <Pawn transform="translate(76.5 146.8) scale(0.8)" fill="#16110d" />
        <g className="nav-art__move">
          <path d="M84 116 L126 80" stroke="#a81e22" strokeWidth="8" strokeLinecap="round" />
          <path d="M134.5 71.5 L129.6 89.2 L116.8 76.4 Z" fill="#a81e22" />
        </g>
      </g>
      <rect x="46" y="150" width="148" height="9" rx="3" fill="#a57c52" />
    </>
  );
}

/** «Material», now the ready-made classes: a stack of books with a diagram card laid on top. */
function MaterialArt() {
  return (
    <>
      <rect x="34" y="150" width="176" height="34" rx="5" fill="#2a2420" />
      <rect x="60" y="162" width="40" height="10" rx="2" fill="#d2a46f" />
      <rect x="50" y="118" width="156" height="32" rx="5" fill="#a81e22" />
      <rect x="150" y="128" width="36" height="8" rx="2" fill="#f4e8d2" />
      <rect x="42" y="90" width="150" height="28" rx="5" fill="#a57c52" />
      <rect x="62" y="99" width="30" height="8" rx="2" fill="#f4e8d2" />
      <g className="nav-art__move">
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
      </g>
    </>
  );
}

/** «Panel del profesor»: a house with a red roof, a board in each window and its chimney smoking. */
function PanelArt() {
  return (
    <>
      <g className="nav-art__move">
        <circle cx="167" cy="44" r="7" fill="#c3c8cd" />
        <circle cx="178" cy="32" r="5" fill="#c3c8cd" opacity="0.7" />
      </g>
      <rect x="160" y="56" width="14" height="34" fill="#2a2420" />
      <rect x="60" y="104" width="120" height="84" fill="#f4e8d2" />
      <rect x="60" y="104" width="120" height="8" fill="#000000" opacity="0.12" />
      <path d="M40 110 L120 46 L200 110 Z" fill="#a81e22" />
      <path d="M120 46 L200 110 H120 Z" fill="#7e1619" opacity="0.5" />
      <rect x="104" y="138" width="32" height="50" rx="4" fill="#8f6a45" />
      <circle cx="129" cy="165" r="3" fill="#fbf4e6" />
      <rect x="72" y="122" width="24" height="24" fill="#fbf4e6" />
      <path d="M72 122h12v12h-12z M84 134h12v12h-12z" fill="#d2a46f" />
      <rect x="144" y="122" width="24" height="24" fill="#fbf4e6" />
      <path d="M144 122h12v12h-12z M156 134h12v12h-12z" fill="#d2a46f" />
      <rect x="50" y="186" width="140" height="9" rx="3" fill="#a57c52" />
    </>
  );
}

/** «Calendario»: a desk calendar whose days are a board, one of them ringed in red. */
function CalendarArt() {
  return (
    <>
      <rect x="54" y="62" width="140" height="136" rx="8" fill="#000000" opacity="0.14" />
      <rect x="50" y="56" width="140" height="136" rx="8" fill="#fbf4e6" />
      <path d="M50 64 a8 8 0 0 1 8 -8 H182 a8 8 0 0 1 8 8 V92 H50 Z" fill="#a81e22" />
      <rect x="84" y="42" width="10" height="26" rx="5" fill="#2a2420" />
      <rect x="146" y="42" width="10" height="26" rx="5" fill="#2a2420" />
      <rect x="66" y="104" width="108" height="72" fill="#f4e8d2" />
      <path
        d="M84 104h18v18h-18z M120 104h18v18h-18z M156 104h18v18h-18z M66 122h18v18h-18z M102 122h18v18h-18z M138 122h18v18h-18z M84 140h18v18h-18z M120 140h18v18h-18z M156 140h18v18h-18z M66 158h18v18h-18z M102 158h18v18h-18z M138 158h18v18h-18z"
        fill="#d2a46f"
      />
      <g className="nav-art__move">
        <circle cx="129" cy="131" r="14" fill="none" stroke="#a81e22" strokeWidth="5" />
      </g>
    </>
  );
}

/** «Mis alumnos», «Alumnos»: two pawns on a round base, the red one beside. */
function StudentsArt() {
  return (
    <>
      <ellipse cx="120" cy="184" rx="74" ry="12" fill="#8f6a45" />
      <ellipse cx="120" cy="180" rx="74" ry="12" fill="#a57c52" />
      <Pawn transform="translate(92 168) scale(2.4)" fill="#2a2420" />
      <g className="nav-art__move">
        <Pawn transform="translate(150 174) scale(2.2)" fill="#a81e22" />
      </g>
    </>
  );
}

/** «Mi ficha»: the teacher's card, a pawn for a portrait and the name in red. */
function ProfileArt() {
  return (
    <>
      <rect x="40" y="70" width="168" height="112" rx="8" fill="#000000" opacity="0.14" />
      <rect x="36" y="64" width="168" height="112" rx="8" fill="#fbf4e6" />
      <rect x="52" y="82" width="56" height="76" rx="4" fill="#f4e8d2" />
      <path
        d="M52 82h28v19h-28z M80 101h28v19h-28z M52 120h28v19h-28z M80 139h28v19h-28z"
        fill="#d2a46f"
        opacity="0.6"
      />
      <g className="nav-art__move">
        <Pawn transform="translate(80 150) scale(1.5)" fill="#16110d" />
      </g>
      <rect x="124" y="90" width="64" height="12" rx="4" fill="#a81e22" />
      <rect x="124" y="114" width="52" height="8" rx="3" fill="#d2a46f" />
      <rect x="124" y="130" width="60" height="8" rx="3" fill="#d2a46f" />
      <rect x="124" y="146" width="40" height="8" rx="3" fill="#d2a46f" />
    </>
  );
}

/** «Tablero de análisis»: a board with the red arrow of a move and the evaluation bar beside it. */
function BoardArt() {
  return (
    <>
      <rect x="36" y="48" width="144" height="144" rx="8" fill="#8f6a45" />
      <rect x="44" y="56" width="128" height="128" fill="#f4e8d2" />
      <path
        d="M76 56h32v32h-32z M140 56h32v32h-32z M44 88h32v32h-32z M108 88h32v32h-32z M76 120h32v32h-32z M140 120h32v32h-32z M44 152h32v32h-32z M108 152h32v32h-32z"
        fill="#d2a46f"
      />
      <path d="M64 164 L116 112" stroke="#a81e22" strokeWidth="8" strokeLinecap="round" />
      <path d="M130 98 L124 118 L110 104 Z" fill="#a81e22" />
      <rect x="190" y="48" width="18" height="144" rx="4" fill="#2a2420" />
      <g className="nav-art__move">
        <rect x="190" y="104" width="18" height="88" rx="4" fill="#fbf4e6" />
      </g>
    </>
  );
}

/** «Explorador»: a magnifying glass over a corner of the board. */
function ExplorerArt() {
  return (
    <>
      <rect x="36" y="68" width="116" height="116" rx="8" fill="#8f6a45" />
      <rect x="40" y="72" width="108" height="108" fill="#f4e8d2" />
      <path d="M76 72h36v36h-36z M40 108h36v36h-36z M112 108h36v36h-36z M76 144h36v36h-36z" fill="#d2a46f" />
      <g className="nav-art__move">
        <path d="M180 140 L212 172" stroke="#a81e22" strokeWidth="16" strokeLinecap="round" />
        <circle cx="150" cy="112" r="40" fill="#fbf4e6" fillOpacity="0.55" stroke="#2a2420" strokeWidth="12" />
        <path
          d="M130 96 a26 26 0 0 1 22 -10"
          fill="none"
          stroke="#ffffff"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.8"
        />
      </g>
    </>
  );
}

/** «Entrenador»: a dumbbell with red plates. */
function TrainerArt() {
  return (
    <g className="nav-art__move">
      <rect x="56" y="112" width="128" height="16" rx="8" fill="#c3c8cd" />
      <rect x="24" y="92" width="16" height="56" rx="5" fill="#7e1619" />
      <rect x="42" y="76" width="22" height="88" rx="6" fill="#a81e22" />
      <rect x="176" y="76" width="22" height="88" rx="6" fill="#a81e22" />
      <rect x="200" y="92" width="16" height="56" rx="5" fill="#7e1619" />
      <rect x="104" y="112" width="32" height="16" fill="#8f6a45" />
    </g>
  );
}

/** «Administración»: a clipboard with the day's list, three ticked and one to do. */
function AdminPanelArt() {
  return (
    <>
      <rect x="56" y="44" width="128" height="160" rx="8" fill="#8f6a45" />
      <rect x="66" y="58" width="108" height="138" rx="4" fill="#fbf4e6" />
      <g className="nav-art__move">
        <rect x="96" y="34" width="48" height="22" rx="6" fill="#2a2420" />
      </g>
      <path
        d="M78 84 l6 6 l10 -12 M78 114 l6 6 l10 -12 M78 144 l6 6 l10 -12"
        fill="none"
        stroke="#a81e22"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="104" y="80" width="56" height="8" rx="3" fill="#d2a46f" />
      <rect x="104" y="110" width="48" height="8" rx="3" fill="#d2a46f" />
      <rect x="104" y="140" width="56" height="8" rx="3" fill="#d2a46f" />
      <rect x="79.5" y="165.5" width="13" height="13" rx="3" fill="none" stroke="#d2a46f" strokeWidth="3" />
      <rect x="104" y="168" width="40" height="8" rx="3" fill="#d2a46f" />
    </>
  );
}

/** «Profesores»: a wooden pawn under a mortarboard with its red tassel. */
function TeachersArt() {
  return (
    <>
      <ellipse cx="120" cy="198" rx="52" ry="8" fill="#5a3d22" opacity="0.25" />
      <Pawn transform="translate(120 196) scale(2.6)" fill="#8f6a45" />
      <g className="nav-art__move">
        <path d="M98 92 V104 C98 112 142 112 142 104 V92 Z" fill="#16110d" />
        <path d="M74 88 L120 68 L166 88 L120 108 Z" fill="#2a2420" />
        <path
          d="M120 88 C140 90 156 90 162 92 V116"
          fill="none"
          stroke="#a81e22"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="120" cy="88" r="5" fill="#a81e22" />
        <path d="M156 116 H168 L171 134 C165 137 159 137 153 134 Z" fill="#a81e22" />
      </g>
    </>
  );
}

/** «Revisión»: an exercise sheet with the red stamp that approves it. */
function ReviewArt() {
  return (
    <>
      <rect x="52" y="56" width="120" height="144" rx="8" fill="#000000" opacity="0.14" />
      <rect x="48" y="50" width="120" height="144" rx="8" fill="#fbf4e6" />
      <rect x="64" y="66" width="56" height="56" fill="#f4e8d2" />
      <path
        d="M78 66h14v14h-14z M106 66h14v14h-14z M64 80h14v14h-14z M92 80h14v14h-14z M78 94h14v14h-14z M106 94h14v14h-14z M64 108h14v14h-14z M92 108h14v14h-14z"
        fill="#d2a46f"
      />
      <rect x="64" y="136" width="84" height="8" rx="3" fill="#d2a46f" />
      <rect x="64" y="152" width="64" height="8" rx="3" fill="#d2a46f" />
      <g className="nav-art__move">
        <g transform="rotate(-12 168 164)">
          <circle cx="168" cy="164" r="30" fill="#fbf4e6" stroke="#a81e22" strokeWidth="7" />
          <path
            d="M154 164 L164 174 L183 152"
            fill="none"
            stroke="#a81e22"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
    </>
  );
}

/** «Series»: exercise cards fanned out, the top one with its board. */
function SeriesArt() {
  return (
    <>
      <rect x="56" y="60" width="96" height="120" rx="8" fill="#a57c52" transform="rotate(-14 120 130)" />
      <rect x="66" y="56" width="96" height="120" rx="8" fill="#a81e22" transform="rotate(-4 120 130)" />
      <g className="nav-art__move">
        <g transform="rotate(8 130 126)">
          <rect x="80" y="54" width="96" height="120" rx="8" fill="#fbf4e6" />
          <rect x="92" y="66" width="72" height="72" fill="#f4e8d2" />
          <path
            d="M110 66h18v18h-18z M146 66h18v18h-18z M92 84h18v18h-18z M128 84h18v18h-18z M110 102h18v18h-18z M146 102h18v18h-18z M92 120h18v18h-18z M128 120h18v18h-18z"
            fill="#d2a46f"
          />
          <rect x="92" y="150" width="48" height="8" rx="3" fill="#d2a46f" />
        </g>
      </g>
    </>
  );
}

/** «Importar»: a sheet dropping into a wooden tray under the red arrow. */
function ImportArt() {
  return (
    <>
      <g transform="rotate(-6 120 110)">
        <rect x="76" y="70" width="88" height="70" rx="6" fill="#fbf4e6" />
        <rect x="88" y="82" width="64" height="8" rx="3" fill="#d2a46f" />
        <rect x="88" y="98" width="48" height="8" rx="3" fill="#d2a46f" />
      </g>
      <path d="M48 130 H88 L100 150 H140 L152 130 H192 V196 a8 8 0 0 1 -8 8 H56 a8 8 0 0 1 -8 -8 Z" fill="#8f6a45" />
      <path
        d="M48 130 H88 L100 150 H140 L152 130 H192"
        fill="none"
        stroke="#5a3d22"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <g className="nav-art__move">
        <path d="M120 34 V80" stroke="#a81e22" strokeWidth="12" strokeLinecap="round" />
        <path d="M96 72 L120 100 L144 72 Z" fill="#a81e22" />
      </g>
    </>
  );
}

/**
 * The home page («Inicio»): the academy's mark, two red squares and two of
 * the board's cream. It names a page and is in no tile, so nothing of it
 * moves.
 */
function HomeArt() {
  return (
    <>
      <path d="M40 40h80v80H40z M120 120h80v80h-80z" fill="#a81e22" />
      <path d="M120 40h80v80h-80z M40 120h80v80H40z" fill="#f4e8d2" />
    </>
  );
}

/** Each drawing's frame: cut close to what it draws, so it fills its slot. */
const VIEW_BOXES: Record<PlatformNavArt, string> = {
  play: "14 26 212 168",
  exercises: "28 -4 222 234",
  rush: "46 36 148 170",
  learn: "40 36 270 176",
  studies: "28 56 184 160",
  teach: "40 12 160 210",
  material: "26 20 192 172",
  panel: "30 24 180 180",
  calendar: "36 32 168 176",
  students: "40 52 160 150",
  profile: "28 52 184 136",
  board: "28 40 188 160",
  explorer: "28 52 196 160",
  trainer: "16 60 208 120",
  adminpanel: "40 26 160 186",
  teachers: "60 48 128 160",
  review: "36 40 172 168",
  series: "34 40 180 160",
  import: "38 26 164 184",
  home: "36 36 168 168",
};

/**
 * The drawing of a tool in the platform's tools menu (2026-10-18 for the
 * bar's sections; one per tool since the Google-style header, 2026-10-19):
 * illustrations, not icons, so they keep their own colours in both themes
 * (the board's cream and wood, the accent's red) instead of reading
 * `currentColor`. They are decoration: the tool's name is its label, so the
 * drawing is hidden from assistive technology. The piece of each one that
 * moves when its tile is pointed at is `nav-art__move`; the menu animates it.
 */
export function NavArt({ art, className }: NavArtProps) {
  // The puzzle piece's clip is referenced by id; a menu may draw it twice
  // (and a story more), so the id is generated.
  const clipId = `nav-art-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  return (
    <svg
      className={`nav-art${className ? ` ${className}` : ""}`}
      viewBox={VIEW_BOXES[art]}
      aria-hidden="true"
      focusable="false"
    >
      {art === "play" && <PlayArt />}
      {art === "exercises" && <ExercisesArt clipId={clipId} />}
      {art === "rush" && <RushArt />}
      {art === "learn" && <LearnArt />}
      {art === "studies" && <StudiesArt />}
      {art === "teach" && <TeachArt />}
      {art === "material" && <MaterialArt />}
      {art === "panel" && <PanelArt />}
      {art === "calendar" && <CalendarArt />}
      {art === "students" && <StudentsArt />}
      {art === "profile" && <ProfileArt />}
      {art === "board" && <BoardArt />}
      {art === "explorer" && <ExplorerArt />}
      {art === "trainer" && <TrainerArt />}
      {art === "adminpanel" && <AdminPanelArt />}
      {art === "teachers" && <TeachersArt />}
      {art === "review" && <ReviewArt />}
      {art === "series" && <SeriesArt />}
      {art === "import" && <ImportArt />}
      {art === "home" && <HomeArt />}
    </svg>
  );
}
