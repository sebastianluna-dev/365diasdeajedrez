import type { ComponentType } from "react";
import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { ChalkboardUserIcon } from "@/components/icons/chalkboard-user-icon.comp";
import { GraduationCapIcon } from "@/components/icons/graduation-cap-icon.comp";
import type { IconProps } from "@/components/icons/icon-variant.const";
import { LayerGroupIcon } from "@/components/icons/layer-group-icon.comp";
import { TrophyIcon } from "@/components/icons/trophy-icon.comp";
import { UserIcon } from "@/components/icons/user-icon.comp";
import { UsersIcon } from "@/components/icons/users-icon.comp";
import { DATABASE_KIND } from "@/constants/platform/study-codes.const";
import type { StudyOrigin, StudySummary } from "@/services/studies/studies.types";
import "./study-chip.comp.css";

/** The colour of a kind's chip: one container of the new design system each. */
type ChipTone = "info" | "success" | "warning" | "secondary" | "neutral";

interface KindLook {
  icon: ComponentType<IconProps>;
  tone: ChipTone;
}

/** Each kind of study, by its catalog code: its icon and its chip's colour. */
const KIND_LOOKS: Record<string, KindLook> = {
  [DATABASE_KIND.MY_GAMES]: { icon: UserIcon, tone: "info" },
  [DATABASE_KIND.STUDY]: { icon: BookOpenIcon, tone: "success" },
  [DATABASE_KIND.TOURNAMENT]: { icon: TrophyIcon, tone: "warning" },
  [DATABASE_KIND.COLLECTION]: { icon: LayerGroupIcon, tone: "secondary" },
};

/** Where a study that is not theirs comes from: its icon and its chip's colour. */
const ORIGIN_LOOKS: Record<StudyOrigin["code"], KindLook> = {
  COURSE: { icon: GraduationCapIcon, tone: "secondary" },
  TEACHER: { icon: ChalkboardUserIcon, tone: "neutral" },
  CLASSES: { icon: UsersIcon, tone: "info" },
};

/** A study's chip: its kind, or where it comes from when it is not theirs. */
export function studyChipOf(study: Pick<StudySummary, "kindCode" | "kindLabel" | "origin">) {
  const look = study.origin
    ? ORIGIN_LOOKS[study.origin.code]
    : (KIND_LOOKS[study.kindCode] ?? { icon: BookOpenIcon, tone: "success" });
  return { ...look, label: study.origin?.label ?? study.kindLabel };
}

/** «9 partidas». */
export const gameCountLabel = (count: number) => `${count} ${count === 1 ? "partida" : "partidas"}`;

interface StudyChipProps {
  study: Pick<StudySummary, "kindCode" | "kindLabel" | "origin">;
  /** Said after the kind, in the same chip: «Torneo · 9 partidas». */
  suffix?: string;
}

/** The chip of a study's kind, in its colour, with its icon. */
export function StudyChip({ study, suffix }: StudyChipProps) {
  const chip = studyChipOf(study);
  const Icon = chip.icon;
  return (
    <span className={`study-chip study-chip_tone_${chip.tone}`}>
      <Icon variant="classic-solid" className="study-chip__icon" />
      <span className="study-chip__label">{suffix ? `${chip.label} · ${suffix}` : chip.label}</span>
    </span>
  );
}
