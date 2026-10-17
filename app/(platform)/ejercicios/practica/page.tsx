import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons/chevron-left-icon.comp";
import { ExercisePracticeSection } from "@/components/platform/sections/exercises/exercise-practice.section";
import { EXERCISES_ENABLED } from "@/constants/platform/features.const";
import { platformRoutes } from "@/lib/platform-routes";
import { getPracticeExercise, getPracticeFilters } from "@/services/exercises/practice.service";

export const metadata: Metadata = {
  title: "Práctica libre",
};

interface PracticePageProps {
  /** `tema` (a Topic code), `nivel` (a Level slug) and `tras` (the exercise just solved, skipped). */
  searchParams: Promise<{ tema?: string; nivel?: string; tras?: string }>;
}

/** A query value as a code: one word of the catalogs' shape, or nothing. */
function codeOf(raw: string | undefined): string | null {
  return raw && /^[A-Za-z0-9_-]{1,64}$/.test(raw) ? raw : null;
}

/**
 * «Práctica libre» (D18, D32): a random library exercise of a topic at a
 * level, the ones never solved first, with the context PRACTICE. Behind
 * `EXERCISES_ENABLED`. The student is the DAL's, through the viewer.
 */
export default async function PracticePage({ searchParams }: PracticePageProps) {
  if (!EXERCISES_ENABLED) notFound();
  const { tema, nivel, tras } = await searchParams;
  const choice = { topicCode: codeOf(tema), levelSlug: codeOf(nivel) };
  const [filters, serving] = await Promise.all([getPracticeFilters(), getPracticeExercise(choice, codeOf(tras))]);
  const subtitle =
    serving.kind === "choose"
      ? "Un ejercicio de la biblioteca al azar, del tema y el nivel que elijas."
      : serving.choiceLabel;

  return (
    <div className="platform-page platform-page_width_wide">
      {/* Serving an exercise, the solve page's left column names it (its h1): no page head. */}
      {serving.kind !== "exercise" && (
        <header className="platform-page__head platform-page__head_kind_solve">
          <Link href={platformRoutes.exercises} className="platform-page__back">
            <ChevronLeftIcon variant="classic-solid" className="platform-page__back-icon" />
            Ejercicios
          </Link>
          <h1 className="platform-page__title">Práctica libre</h1>
          <p className="platform-page__subtitle">{subtitle}</p>
        </header>
      )}
      <ExercisePracticeSection filters={filters} choice={choice} serving={serving} />
    </div>
  );
}
