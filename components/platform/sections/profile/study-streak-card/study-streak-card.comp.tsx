import { FireIcon } from "@/components/icons/fire-icon.comp";
import type { StreakSummary } from "@/services/study-goal/study-goal.types";
import "./study-streak-card.comp.css";

interface StudyStreakCardProps {
  streak: StreakSummary;
  isOwn: boolean;
}

/**
 * «Racha de estudio» (N5): the days in a row, whether today is already
 * studied, and this week's days and minutes. It only reads the activity log:
 * playing never writes it, so no game ever moves these figures.
 */
export function StudyStreakCard({ streak, isOwn }: StudyStreakCardProps) {
  const { days, studiedToday } = streak.streak;
  return (
    <section className="study-streak-card" aria-labelledby="study-streak-card-title">
      <header className="study-streak-card__head">
        <FireIcon className="study-streak-card__icon" />
        <h2 id="study-streak-card-title" className="study-streak-card__title">
          Racha de estudio
        </h2>
      </header>
      <p className="study-streak-card__figure">
        {days} <span className="study-streak-card__unit">{days === 1 ? "día" : "días"}</span>
      </p>
      <p className="study-streak-card__note">
        {studiedToday ? (isOwn ? "Hoy ya estudiaste" : "Hoy ya estudió") : "Hoy todavía no"} · {streak.daysThisWeek}{" "}
        {streak.daysThisWeek === 1 ? "día" : "días"} y {streak.minutesThisWeek} min esta semana
      </p>
    </section>
  );
}
