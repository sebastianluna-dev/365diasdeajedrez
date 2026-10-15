import Link from "next/link";
import { ProgressIndicator } from "@/components/platform/shared/progress-indicator/progress-indicator.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { getUserDashboard } from "@/services/dashboard/dashboard.service";
import "./continue-studying.section.css";

interface ContinueStudyingSectionProps {
  /** `primary` (default): «Continuar» is the page's accent; `secondary` on a class day, when «Entrar a la clase» is. */
  emphasis?: "primary" | "secondary";
}

export async function ContinueStudyingSection({ emphasis = "primary" }: ContinueStudyingSectionProps = {}) {
  const { continueStudying } = await getUserDashboard();

  return (
    <section className="platform-card continue-studying">
      <h2 className="platform-card__title">Continuar estudiando</h2>

      {continueStudying ? (
        <div className="continue-studying__body">
          <p className="continue-studying__course">{continueStudying.courseName}</p>
          <p className="continue-studying__lesson">Te quedaste en: {continueStudying.lessonName}</p>
          <ProgressIndicator
            percent={continueStudying.percent}
            detail={`${continueStudying.completedLessons} de ${continueStudying.totalLessons} lecciones`}
          />
          <Link
            href={continueStudying.href}
            className={`platform-button${emphasis === "primary" ? " platform-button_variant_accent" : ""} platform-button_size_lg continue-studying__cta`}
          >
            Continuar
          </Link>
        </div>
      ) : (
        <EmptyState
          title="No tienes ningún curso en progreso"
          description="Empieza uno de tus cursos, o agrega uno del catálogo, para verlo aquí."
          actionLabel="Ver mis cursos"
          actionHref={platformRoutes.courses}
        />
      )}
    </section>
  );
}
