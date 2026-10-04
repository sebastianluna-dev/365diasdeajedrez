import { AngleRightIcon } from "@/components/icons/angle-right-icon.comp";
import { FireIcon } from "@/components/icons/fire-icon.comp";
import type { StudyStreak as StudyStreakModel } from "@/services/study-goal/study-goal.types";
import "./study-streak.comp.css";

interface StudyStreakProps {
  streak: StudyStreakModel;
}

/** What the card says under the figure, by where the streak stands today. */
function noteOf({ days, studiedToday }: StudyStreakModel): string {
  if (days === 0) return "Estudia hoy para empezar una racha.";
  // The figure it becomes is drawn beside it for the eye only: here it is said in words.
  if (!studiedToday) return `Estudia hoy para mantener tu racha y llegar a ${days + 1} días seguidos.`;
  return `${days} ${days === 1 ? "día seguido" : "días seguidos"} estudiando.`;
}

/**
 * «Racha diaria»: how many days in a row the student has been studying.
 *
 * While today is not in the streak yet, the figure is shown next to the one
 * it becomes by studying today — «11 › 12», the second one unlit —: the
 * streak still stands, and what is left to do is in sight. Once they have
 * studied, the figure is alone.
 *
 * Both figures are text, and an unlit one is drawn grey but readable. The
 * second is for the eye only (`aria-hidden`), beside a sentence that says the
 * number it stands for in words, so a screen reader hears it once and not as
 * «11 12».
 */
export function StudyStreak({ streak }: StudyStreakProps) {
  const isLit = streak.days > 0;

  return (
    <section className="study-streak">
      <h2 className="study-streak__title">Racha diaria</h2>

      <p className="study-streak__figures">
        <span className={`study-streak__figure${isLit ? "" : " study-streak__figure_state_unlit"}`}>
          <FireIcon variant="solid" className="study-streak__flame" coreClassName="study-streak__flame-core" />
          <span className="study-streak__value">{streak.days}</span>
        </span>

        {!streak.studiedToday && (
          <>
            <AngleRightIcon className="study-streak__arrow" />
            <span className="study-streak__figure study-streak__figure_state_unlit" aria-hidden="true">
              <FireIcon variant="solid" className="study-streak__flame" coreClassName="study-streak__flame-core" />
              <span className="study-streak__value">{streak.days + 1}</span>
            </span>
          </>
        )}
      </p>

      <p className="study-streak__note">{noteOf(streak)}</p>
    </section>
  );
}
