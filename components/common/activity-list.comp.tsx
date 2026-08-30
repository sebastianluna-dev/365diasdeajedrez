import type { ActivityItem } from "@/services/dashboard/dashboard.types";
import "./activity-list.comp.css";

interface ActivityListProps {
  items: ActivityItem[];
}

export function ActivityList({ items }: ActivityListProps) {
  return (
    <ul className="activity-list">
      {items.map((item) => (
        <li key={item.id} className="activity-list__item">
          <div className="activity-list__main">
            <span className="activity-list__type">{item.typeLabel}</span>
            {item.subjectName && <span className="activity-list__subject">{item.subjectName}</span>}
          </div>
          <div className="activity-list__meta">
            {item.topicLabel && <span className="activity-list__topic">{item.topicLabel}</span>}
            <span className="activity-list__date">{item.dateLabel}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
