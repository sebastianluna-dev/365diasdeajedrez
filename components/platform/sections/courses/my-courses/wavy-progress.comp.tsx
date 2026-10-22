import "./wavy-progress.comp.css";

interface WavyProgressProps {
  /** Whole percentage, 0–100. */
  percent: number;
  /** A finished course: a straight line in the success green. */
  isDone?: boolean;
  /** `lg` for «Sigue donde ibas», the bare one for a card. */
  size?: "lg";
}

/** The drawing's width; it stretches to its box, the line keeping its weight. */
const WIDTH = 200;
const MIDDLE = 6;
/** The gap between what is done and the track that is left. */
const GAP = 6;

/** A sine from `from` to `to` around the middle line, one wave every 16 units. */
function waveOf(from: number, to: number): string {
  let path = `M${from} ${MIDDLE}`;
  for (let x = from + 2; x <= to; x += 2) {
    path += ` L${x} ${(MIDDLE + 2.5 * Math.sin(((x - from) / 16) * 2 * Math.PI)).toFixed(2)}`;
  }
  return path;
}

/**
 * How far a course is gone, as Material 3 draws its progress: what is done is
 * a wave in the primary's blue, what is left a straight track after a gap. A
 * finished course is one straight line in the success green. It is read
 * beside its figure, which says the same in words, so the drawing itself is
 * `aria-hidden`.
 */
export function WavyProgress({ percent, isDone = false, size }: WavyProgressProps) {
  const end = Math.max(4, Math.round((WIDTH - 4) * (percent / 100)));
  // Nothing done: the track alone, from the start.
  const trackFrom = percent > 0 ? end + GAP : 2;
  return (
    <svg
      className={`wavy-progress${size ? ` wavy-progress_size_${size}` : ""}${isDone ? " wavy-progress_state_done" : ""}`}
      viewBox={`0 0 ${WIDTH} 12`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {isDone ? (
        <path className="wavy-progress__done" d={`M2 ${MIDDLE} H${WIDTH - 2}`} />
      ) : (
        <>
          {trackFrom < WIDTH - 2 && (
            <path className="wavy-progress__track" d={`M${trackFrom} ${MIDDLE} H${WIDTH - 2}`} />
          )}
          {percent > 0 && <path className="wavy-progress__done" d={waveOf(2, end)} />}
        </>
      )}
    </svg>
  );
}
