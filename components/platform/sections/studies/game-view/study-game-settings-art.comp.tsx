import "./study-game-settings-art.comp.css";

/** What a drawing shows: one per option of a study's «Ajustes del capítulo». */
export type StudyGameSettingsArtKind = "white" | "black" | "normal" | "conceal" | "annotations" | "variations" | "game";

interface StudyGameSettingsArtProps {
  kind: StudyGameSettingsArtKind;
}

/** The dark squares of a 4×4 corner of a board, `size` px wide, from (x, y). */
function darkSquares(x: number, y: number, size: number) {
  const cell = size / 4;
  return Array.from({ length: 16 }, (_, index) => index)
    .filter((index) => ((index % 4) + Math.floor(index / 4)) % 2 === 1)
    .map((index) => (
      <rect
        key={index}
        className="study-game-settings-art__dark"
        x={x + (index % 4) * cell}
        y={y + Math.floor(index / 4) * cell}
        width={cell}
        height={cell}
      />
    ));
}

/** A corner of a board: its light ground and its dark squares. */
function Board({ x, y, size, tone }: { x: number; y: number; size: number; tone?: "danger" }) {
  return (
    <g className={tone ? `study-game-settings-art__board_tone_${tone}` : undefined}>
      <rect className="study-game-settings-art__light" x={x} y={y} width={size} height={size} rx="3" />
      {darkSquares(x, y, size)}
    </g>
  );
}

/** A row of four pawns on the board's corner: White's, ringed in ink, or Black's. */
function Pawns({ row, side }: { row: number; side: "white" | "black" }) {
  return (
    <>
      {[0, 1, 2, 3].map((file) => (
        <circle
          key={file}
          className={`study-game-settings-art__pawn study-game-settings-art__pawn_side_${side}`}
          cx={file * 10 + 5}
          cy={row * 10 + 5}
          r="3.2"
        />
      ))}
    </>
  );
}

/** The board in its frame, White at the bottom; turning over, for Black. */
function Side({ turning }: { turning: boolean }) {
  return (
    <g transform="translate(28 8)">
      <g className={turning ? "study-game-settings-art__flip" : undefined}>
        <rect className="study-game-settings-art__frame" x="-3" y="-3" width="46" height="46" rx="5" />
        <Board x={0} y={0} size={40} />
        <Pawns row={3} side="white" />
        <Pawns row={0} side="black" />
      </g>
    </g>
  );
}

/** A sheet with a line of moves, as the notation reads them. */
function Sheet() {
  return (
    <>
      <rect className="study-game-settings-art__sheet" x="6" y="6" width="84" height="44" rx="5" />
      {[
        [14, 14],
        [34, 14],
        [54, 14],
        [74, 10],
      ].map(([x, width]) => (
        <rect key={x} className="study-game-settings-art__word" x={x} y="25" width={width} height="5" rx="2.5" />
      ))}
    </>
  );
}

/** Three moves of the notation beside the board. */
function Moves({ only }: { only?: number }) {
  return (
    <>
      {[12, 25, 38].slice(0, only).map((y) => (
        <rect key={y} className="study-game-settings-art__word" x="54" y={y} width="34" height="5" rx="2.5" />
      ))}
    </>
  );
}

/**
 * The drawing at the right of each option of a study's «Ajustes de la
 * partida» (2026-10-23, the owner's choice: «C» for the first four, «B» for
 * the last three, in the board's blues): the board turning over for Black;
 * the sheet of moves with the mark walking it, and veiling what follows it;
 * the board losing its arrow and its circle, its variation drawing back into
 * the main line, and the whole board shrinking away. An illustration, not an
 * icon: drawn here by hand in the platform's Material roles, and hidden from
 * screen readers, since the option's words say the same. Still under
 * `prefers-reduced-motion`.
 */
export function StudyGameSettingsArt({ kind }: StudyGameSettingsArtProps) {
  return (
    <svg className="study-game-settings-art" width="96" height="56" viewBox="0 0 96 56" aria-hidden="true">
      {kind === "white" && <Side turning={false} />}
      {kind === "black" && <Side turning />}

      {kind === "normal" && (
        <>
          <Sheet />
          <path className="study-game-settings-art__mark study-game-settings-art__walk" d="M14 36 h14" />
        </>
      )}

      {kind === "conceal" && (
        <>
          <Sheet />
          <g className="study-game-settings-art__walk">
            <path className="study-game-settings-art__mark" d="M14 36 h14" />
            <rect className="study-game-settings-art__veil" x="32" y="18" width="58" height="20" rx="3" />
          </g>
        </>
      )}

      {kind === "annotations" && (
        <>
          <Board x={6} y={8} size={40} />
          <Moves />
          <g className="study-game-settings-art__fade">
            <path className="study-game-settings-art__arrow" d="M11 43 L36 18" />
            <path className="study-game-settings-art__arrow-head" d="M39 15 L30 17 L36 23 Z" />
            <circle className="study-game-settings-art__circle" cx="36" cy="38" r="5" />
          </g>
        </>
      )}

      {kind === "variations" && (
        <>
          <Board x={6} y={8} size={40} />
          <Moves only={1} />
          <g className="study-game-settings-art__prune">
            <path className="study-game-settings-art__branch" d="M58 17 V30 H88" />
            <rect className="study-game-settings-art__twig" x="62" y="36" width="26" height="4" rx="2" />
          </g>
        </>
      )}

      {kind === "game" && (
        <>
          <g className="study-game-settings-art__shrink">
            <Board x={28} y={8} size={40} tone="danger" />
          </g>
          <path className="study-game-settings-art__cross" d="M40 20 L56 36 M56 20 L40 36" />
        </>
      )}
    </svg>
  );
}
