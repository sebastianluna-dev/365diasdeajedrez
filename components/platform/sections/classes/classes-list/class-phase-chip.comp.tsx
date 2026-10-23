import { CLASS_PHASE, type ClassPhaseCode } from "@/constants/platform/class-codes.const";
import "./class-phase-chip.comp.css";

/** The student's word for each phase: a class nobody finalized yet is «Finalizada» to them. */
const LABELS: Record<ClassPhaseCode, string> = {
  [CLASS_PHASE.UPCOMING]: "Programada",
  [CLASS_PHASE.OPEN]: "Enlace abierto",
  [CLASS_PHASE.IN_PROGRESS]: "En vivo",
  [CLASS_PHASE.AWAITING_CLOSE]: "Finalizada",
  [CLASS_PHASE.DONE]: "Finalizada",
  [CLASS_PHASE.CANCELLED]: "Cancelada",
};

/** The tone of each phase's pill. */
const TONES: Record<ClassPhaseCode, "quiet" | "open" | "live" | "done"> = {
  [CLASS_PHASE.UPCOMING]: "quiet",
  [CLASS_PHASE.OPEN]: "open",
  [CLASS_PHASE.IN_PROGRESS]: "live",
  [CLASS_PHASE.AWAITING_CLOSE]: "done",
  [CLASS_PHASE.DONE]: "done",
  [CLASS_PHASE.CANCELLED]: "quiet",
};

/**
 * The phase of a class as the new design system's small pill (2026-10-23,
 * «Mis clases»): «Programada» in grey, «Enlace abierto» in the primary on
 * white, «En vivo» filled with the primary and a beating dot (still under
 * reduced motion), «Finalizada» in green, «Cancelada» in grey. The words are
 * `ClassStatusTag`'s for the student; the pages not yet moved keep that tag.
 */
export function ClassPhaseChip({ phase }: { phase: ClassPhaseCode }) {
  const tone = TONES[phase];
  return (
    <span className={`class-phase-chip class-phase-chip_tone_${tone}`}>
      {tone === "live" && <span className="class-phase-chip__dot" aria-hidden="true" />}
      {LABELS[phase]}
    </span>
  );
}
