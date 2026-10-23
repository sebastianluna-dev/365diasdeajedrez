import Link from "next/link";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import { mdButton } from "@/lib/material/material-classes";
import type { StudyResume, StudySummary } from "@/services/studies/studies.types";
import { gameCountLabel, StudyChip } from "../study-chip/study-chip.comp";
import "./resume-study.comp.css";

interface ResumeStudyProps {
  /** The study whose game was opened last, with the game it was left on. */
  study: StudySummary & { resume: StudyResume };
}

/**
 * «Sigue donde ibas» (the new design system, 2026-10-23): the study whose
 * game the student opened last, at the head of the library, on the
 * container's grey — its board where that game ends, its name, which game
 * and who played it, its kind and its size, and «Seguir», which opens that
 * game. Which move inside it is this browser's to remember (`GameViewSection`),
 * so it is not said here.
 */
export function ResumeStudy({ study }: ResumeStudyProps) {
  const game = [study.resume.gameName, study.resume.players].filter(Boolean).join(" · ");

  return (
    <section className="resume-study" aria-labelledby={`resume-study-${study.id}`}>
      <span className="resume-study__board" aria-hidden="true">
        <StaticDiagram fen={study.boardFen} orientation={study.boardOrientation} look="material" />
      </span>

      <div className="resume-study__body">
        <p className="resume-study__eyebrow">Sigue donde ibas</p>
        <h2 id={`resume-study-${study.id}`} className="resume-study__name">
          {study.name}
        </h2>
        <p className="resume-study__game">{game}</p>
        <div className="resume-study__meta">
          <StudyChip study={study} />
          <span className="resume-study__detail">
            {gameCountLabel(study.gameCount)} · abierto {study.resume.openedAgoLabel}
          </span>
        </div>
      </div>

      <Link href={study.href} className={`${mdButton("filled", "md")} resume-study__action`}>
        <PlayIcon variant="classic-solid" className="platform-md-icon" />
        Seguir
      </Link>
    </section>
  );
}
