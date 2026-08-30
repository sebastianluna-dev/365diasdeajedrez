import Link from "next/link";
import { ProgressIndicator } from "@/components/common/progress-indicator.comp";
import { EmptyState } from "@/components/common/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { getUserDashboard } from "@/services/dashboard/dashboard.service";
import "./continue-studying.section.css";

export async function ContinueStudyingSection() {
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
          <Link href={continueStudying.href} className="platform-button continue-studying__cta">
            Continuar
          </Link>
        </div>
      ) : (
        <EmptyState
          title="No tienes ningún curso en progreso"
          description="Empieza un curso para verlo aquí."
          actionLabel="Ver mis cursos"
          actionHref={platformRoutes.courses}
        />
      )}
    </section>
  );
}
