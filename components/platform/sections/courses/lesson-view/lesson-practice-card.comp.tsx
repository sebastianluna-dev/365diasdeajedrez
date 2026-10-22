import Link from "next/link";
import { PuzzlePieceIcon } from "@/components/icons/puzzle-piece-icon.comp";
import { mdButton, mdCard } from "@/lib/material/material-classes";
import type { LessonPractice } from "@/services/exercises/lesson-practice.types";
import "./lesson-practice-card.comp.css";

interface LessonPracticeCardProps {
  practice: LessonPractice;
}

/**
 * «Ahora practica» (D25, D26): after the lesson's game, one row that says how
 * many exercises the lesson has, how many the student solved — by solve key,
 * so a copy of a library exercise they solved elsewhere counts — and the way
 * in: «Empezar», «Continuar», or nothing left once every one is solved or was
 * tried today. The exercises are optional: completing the lesson is the
 * board's button, not this.
 */
export function LessonPracticeCard({ practice }: LessonPracticeCardProps) {
  const count = `${practice.total} ${practice.total === 1 ? "ejercicio" : "ejercicios"}`;
  const standing =
    practice.solved === practice.total
      ? practice.total === 1
        ? "Resuelto"
        : "Todos resueltos"
      : `${practice.solved} de ${practice.total} ${practice.total === 1 ? "resuelto" : "resueltos"}`;

  return (
    <aside className={`${mdCard("outlined")} lesson-practice-card`} aria-label="Ejercicios de la lección">
      <span className="lesson-practice-card__disc" aria-hidden="true">
        <PuzzlePieceIcon variant="duotone-solid" className="lesson-practice-card__icon" />
      </span>
      <p className="lesson-practice-card__text">
        <span className="lesson-practice-card__title">Ahora practica: {count}</span>
        <span className="lesson-practice-card__standing">{standing}</span>
      </p>
      {practice.start ? (
        <Link href={practice.start.href} className={mdButton("tonal", "sm")}>
          {practice.start.label}
        </Link>
      ) : (
        practice.items[0] && (
          <Link href={practice.items[0].href} className={mdButton("text", "sm")}>
            Repasar
          </Link>
        )
      )}
    </aside>
  );
}
