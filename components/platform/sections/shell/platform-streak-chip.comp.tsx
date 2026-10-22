import { FireIcon } from "@/components/icons/fire-icon.comp";
import "./platform-streak-chip.comp.css";

interface PlatformStreakChipProps {
  /** Days in a row studying (`getStudyStreak`). */
  days: number;
}

/**
 * The streak in the bar, beside the tools (2026-10-22, the new design
 * system's header): the flame and the days, in a pill of Material 3's
 * container. It only says; the day's goal and the rest are behind the avatar.
 */
export function PlatformStreakChip({ days }: PlatformStreakChipProps) {
  const label = `${days} ${days === 1 ? "día" : "días"}`;
  return (
    <p className="platform-streak-chip">
      <FireIcon
        variant="duotone-solid"
        className="platform-streak-chip__flame"
        coreClassName="platform-streak-chip__core"
      />
      <span className="platform-streak-chip__hint">Racha de estudio: </span>
      {label}
    </p>
  );
}
