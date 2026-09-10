import type { ReviewStatContent } from "@/services/home/home.types";
import "./review-stat-card.comp.css";

interface ReviewStatCardProps {
  stat: ReviewStatContent;
  position: "center" | "left" | "right";
  hidden: boolean;
}

export function ReviewStatCard({ stat, position, hidden }: ReviewStatCardProps) {
  return (
    <div aria-hidden={hidden} className={`reviews__stat reviews__stat_position_${position}`}>
      <span className="reviews__stat-label">{stat.label}</span>
      <strong className="reviews__stat-value">{stat.value}</strong>
      <p className="reviews__stat-text">{stat.text}</p>
    </div>
  );
}
