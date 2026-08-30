import Link from "next/link";
import { LocalDateTime } from "@/components/common/local-datetime.comp";
import { CLASS_STATUS } from "@/constants/platform/class-codes.const";
import type { ClassSummary } from "@/services/classes/classes.types";
import "./class-card.comp.css";

interface ClassCardProps {
  classSummary: ClassSummary;
}

export function ClassCard({ classSummary }: ClassCardProps) {
  const isCancelled = classSummary.statusCode === CLASS_STATUS.CANCELLED;

  return (
    <Link
      href={classSummary.href}
      className={`platform-card class-card${isCancelled ? " class-card_cancelled" : ""}`}
    >
      <div className="class-card__info">
        <h3 className="class-card__title">{classSummary.title}</h3>
        <p className="class-card__teacher">{classSummary.teacherName}</p>
      </div>

      <div className="class-card__meta">
        <span className="class-card__schedule">
          <LocalDateTime
            iso={classSummary.scheduledAtIso}
            fallback={`${classSummary.dateLabel} · ${classSummary.timeLabel}`}
          />{" "}
          · {classSummary.durationMin} min
        </span>
        <span
          className={`platform-tag class-card__status class-card__status_code_${classSummary.statusCode.toLowerCase()}`}
        >
          {classSummary.statusLabel}
        </span>
      </div>
    </Link>
  );
}
