import { getUserDashboard } from "@/services/dashboard/dashboard.service";
import { StatsCards } from "./stats-cards.comp";
import "./activity-stats.section.css";

export async function ActivityStatsSection() {
  const { stats } = await getUserDashboard();

  return (
    <section className="platform-card activity-stats">
      <h2 className="platform-card__title">Tus estadísticas</h2>
      <StatsCards stats={stats} />
    </section>
  );
}
