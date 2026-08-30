import { EmptyState } from "@/components/common/empty-state.comp";
import { getUserClasses } from "@/services/classes/classes.service";
import { ClassCard } from "./class-card.comp";
import "./classes-list.section.css";

export async function ClassesListSection() {
  const { upcoming, past } = await getUserClasses();

  return (
    <div className="classes-list">
      <div className="classes-list__group">
        <h2 className="classes-list__group-title">Próximas clases</h2>
        {upcoming.length > 0 ? (
          <div className="classes-list__items">
            {upcoming.map((item) => (
              <ClassCard key={item.id} classSummary={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No tienes clases programadas"
            description="Cuando tu profesor agende una clase aparecerá aquí con su fecha y enlace."
          />
        )}
      </div>

      <div className="classes-list__group">
        <h2 className="classes-list__group-title">Clases pasadas</h2>
        {past.length > 0 ? (
          <div className="classes-list__items">
            {past.map((item) => (
              <ClassCard key={item.id} classSummary={item} />
            ))}
          </div>
        ) : (
          <EmptyState title="Todavía no has tomado clases" />
        )}
      </div>
    </div>
  );
}
