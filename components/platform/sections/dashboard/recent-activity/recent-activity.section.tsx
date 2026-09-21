import { ActivityList } from "@/components/platform/shared/activity-list.comp";
import { EmptyState } from "@/components/platform/shared/empty-state.comp";
import { getUserDashboard } from "@/services/dashboard/dashboard.service";
import "./recent-activity.section.css";

export async function RecentActivitySection() {
  const { recentActivity } = await getUserDashboard();

  return (
    <section className="platform-card recent-activity">
      <h2 className="platform-card__title">Actividad reciente</h2>

      {recentActivity.length > 0 ? (
        <ActivityList items={recentActivity} />
      ) : (
        <EmptyState
          title="Sin actividad todavía"
          description="Completa lecciones o resuelve ejercicios para ver tu actividad."
        />
      )}
    </section>
  );
}
