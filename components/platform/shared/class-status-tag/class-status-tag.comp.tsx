import { CLASS_PHASE, type ClassPhaseCode } from "@/constants/platform/class-codes.const";
import { BanIcon } from "@/components/icons/ban-icon.comp";
import { CalendarIcon } from "@/components/icons/calendar-icon.comp";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { HourglassHalfIcon } from "@/components/icons/hourglass-half-icon.comp";
import { VideoIcon } from "@/components/icons/video-icon.comp";
import type { ClassAudience } from "@/services/shared/class-rules";
import "./class-status-tag.comp.css";

interface ClassStatusTagProps {
  /** What the clock makes of the class (`classPhase`), never the stored status. */
  phase: ClassPhaseCode;
  /** The student reads «Finalizada» where the teacher and the staff read «Por finalizar». */
  audience: ClassAudience;
}

type Look = { label: string; variant: string | null; icon: typeof CalendarIcon | null };

const LOOKS: Record<ClassPhaseCode, Look> = {
  [CLASS_PHASE.UPCOMING]: { label: "Programada", variant: null, icon: CalendarIcon },
  [CLASS_PHASE.OPEN]: { label: "Enlace abierto", variant: "wash", icon: VideoIcon },
  [CLASS_PHASE.IN_PROGRESS]: { label: "En vivo", variant: "live", icon: null },
  [CLASS_PHASE.AWAITING_CLOSE]: { label: "Por finalizar", variant: "warning", icon: HourglassHalfIcon },
  [CLASS_PHASE.DONE]: { label: "Finalizada", variant: "success", icon: CircleCheckIcon },
  [CLASS_PHASE.CANCELLED]: { label: "Cancelada", variant: null, icon: BanIcon },
};

/**
 * The phase of a class as a tag: a word, its icon and its tone, the same on
 * every screen of the three roles. «En vivo» carries a beating dot instead
 * of an icon, stilled under reduced motion. A class that ended and nobody
 * finalized is «Por finalizar» to whoever has to finalize it, and
 * «Finalizada» to the student, who has nothing to do about it.
 */
export function ClassStatusTag({ phase, audience }: ClassStatusTagProps) {
  const look = phase === CLASS_PHASE.AWAITING_CLOSE && audience === "student" ? LOOKS[CLASS_PHASE.DONE] : LOOKS[phase];
  const Icon = look.icon;
  return (
    <span className={`platform-tag class-status-tag${look.variant ? ` platform-tag_variant_${look.variant}` : ""}`}>
      {look.variant === "live" && <span className="class-status-tag__dot" aria-hidden="true" />}
      {Icon && <Icon variant="classic-solid" className="platform-tag__icon" />}
      {look.label}
    </span>
  );
}
