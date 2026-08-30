"use client";

import { useState } from "react";
import type { DashboardStats, StatsRangeKey } from "@/services/dashboard/dashboard.types";
import "./stats-cards.comp.css";

const RANGE_LABELS: { key: StatsRangeKey; label: string }[] = [
  { key: "week", label: "Esta semana" },
  { key: "month", label: "Este mes" },
  { key: "year", label: "Este año" },
  { key: "all", label: "Todo el tiempo" },
];

interface StatsCardsProps {
  stats: DashboardStats;
}

// Los cuatro rangos llegan precalculados del servidor; el toggle es local.
export function StatsCards({ stats }: StatsCardsProps) {
  const [range, setRange] = useState<StatsRangeKey>("week");
  const current = stats[range];

  return (
    <div className="stats-cards">
      <div className="stats-cards__filters" role="tablist" aria-label="Periodo de estadísticas">
        {RANGE_LABELS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={range === item.key}
            onClick={() => setRange(item.key)}
            className={`stats-cards__filter${range === item.key ? " stats-cards__filter_active" : ""}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="stats-cards__grid">
        {current.totals.map((stat) => (
          <div key={stat.label} className="stats-cards__card">
            <span className="stats-cards__value">{stat.count}</span>
            <span className="stats-cards__label">{stat.label}</span>
          </div>
        ))}
      </div>

      {current.topics.length > 0 && (
        <div className="stats-cards__topics">
          <span className="stats-cards__topics-title">Por tema:</span>
          {current.topics.map((topic) => (
            <span key={topic.label} className="platform-tag stats-cards__topic">
              {topic.label} · {topic.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
