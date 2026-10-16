import Link from "next/link";
import { ClassTicket } from "@/components/platform/shared/class-ticket/class-ticket.comp";
import { EmptyState } from "@/components/platform/shared/empty-state/empty-state.comp";
import { platformRoutes } from "@/lib/platform-routes";
import { getNextClass, getStudentSeatBalance } from "@/services/classes/classes.service";
import "./next-class.section.css";

/**
 * «Próxima clase» on the dashboard: the first class ahead as its ticket,
 * with how to join it, and under it how many classes are left, in counts.
 * Without a class, what there is to schedule, or that nothing is scheduled.
 */
export async function NextClassSection() {
  const [nextClass, balance] = await Promise.all([getNextClass(), getStudentSeatBalance()]);
  // «Te quedan 3 clases», without the breakdown.
  const balanceShort = balance && balance.left > 0 ? balance.line.split(":")[0] : null;

  return (
    <section className="next-class" aria-labelledby="proxima-clase">
      <h2 id="proxima-clase" className="next-class__title">
        Próxima clase
      </h2>

      {nextClass ? (
        <>
          <ClassTicket card={nextClass} />
          <p className="next-class__foot">
            {balanceShort && <span>{balanceShort} · </span>}
            <Link href={platformRoutes.classes} className="next-class__link">
              Ver mis clases
            </Link>
          </p>
        </>
      ) : balance && balance.toSchedule > 0 ? (
        <EmptyState
          title={`Tienes ${balance.toSchedule} ${balance.toSchedule === 1 ? "clase" : "clases"} por programar`}
          description="Administración te escribirá para fijar la fecha."
          actionLabel="Ver mis clases"
          actionHref={platformRoutes.classes}
        />
      ) : (
        <EmptyState
          title="No tienes clases programadas"
          description="Cuando administración programe una clase contigo, aparecerá aquí."
          actionLabel="Ver mis clases"
          actionHref={platformRoutes.classes}
        />
      )}
    </section>
  );
}
