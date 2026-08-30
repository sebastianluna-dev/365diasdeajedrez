export interface DashboardProfile {
  displayName: string;
  email: string;
  memberSinceLabel: string;
}

export type StatsRangeKey = "week" | "month" | "year" | "all";

export interface StatCount {
  label: string;
  count: number;
}

export interface DashboardStatsRange {
  /** Totales por tipo de actividad (cursos completados, clases asistidas...). */
  totals: StatCount[];
  /** Desglose por tema (táctica, aperturas, finales...). */
  topics: StatCount[];
}

export type DashboardStats = Record<StatsRangeKey, DashboardStatsRange>;

export interface ContinueStudyingCard {
  courseName: string;
  lessonName: string;
  percent: number;
  completedLessons: number;
  totalLessons: number;
  href: string;
}

export interface ActivityItem {
  id: string;
  typeLabel: string;
  subjectName?: string;
  topicLabel?: string;
  dateLabel: string;
}

export interface DashboardData {
  profile: DashboardProfile;
  stats: DashboardStats;
  continueStudying?: ContinueStudyingCard;
  recentActivity: ActivityItem[];
}
