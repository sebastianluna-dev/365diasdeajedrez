import Link from "next/link";
import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import { LocalDateTime } from "@/components/platform/shared/local-datetime.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { getUserClasses } from "@/services/classes/classes.service";
import "./next-class.section.css";

export async function NextClassSection() {
  const { upcoming } = await getUserClasses();
  const nextClass = upcoming[0];

  return (
    <section className="platform-card next-class">
      <h2 className="platform-card__title">Próxima clase</h2>

      {nextClass ? (
        <div className="next-class__body">
          <p className="next-class__name">{nextClass.title}</p>
          <p className="next-class__teacher">{nextClass.teacherName}</p>
          <p className="next-class__schedule">
            <LocalDateTime
              iso={nextClass.scheduledAtIso}
              fallback={`${nextClass.dateLabel} · ${nextClass.timeLabel}`}
            />{" "}
            · {nextClass.durationMin} min
          </p>
          <span className="platform-tag platform-tag_variant_accent next-class__status">{nextClass.statusLabel}</span>
          <Link href={nextClass.href} className="platform-button platform-button_variant_secondary next-class__cta">
            Ver detalle
          </Link>
        </div>
      ) : (
        <EmptyState
          title="No tienes clases programadas"
          description="Cuando tu profesor agende una clase aparecerá aquí."
          actionLabel="Ver mis clases"
          actionHref={platformRoutes.classes}
        />
      )}
    </section>
  );
}
