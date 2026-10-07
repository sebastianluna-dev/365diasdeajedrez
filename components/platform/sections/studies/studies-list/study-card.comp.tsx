import Link from "next/link";
import type { ComponentType } from "react";
import { StaticDiagram } from "@/components/chess/static-diagram.comp";
import { BookOpenIcon } from "@/components/icons/book-open-icon.comp";
import { BooksIcon } from "@/components/icons/books-icon.comp";
import { ChalkboardUserIcon } from "@/components/icons/chalkboard-user-icon.comp";
import { GraduationCapIcon } from "@/components/icons/graduation-cap-icon.comp";
import type { IconProps } from "@/components/icons/icon-variant.const";
import { TrophyIcon } from "@/components/icons/trophy-icon.comp";
import { UserIcon } from "@/components/icons/user-icon.comp";
import { UsersIcon } from "@/components/icons/users-icon.comp";
import { DATABASE_KIND } from "@/constants/platform/study-codes.const";
import type { StudyOrigin, StudySummary } from "@/services/studies/studies.types";
import { DeleteStudy } from "./delete-study.comp";
import "./study-card.comp.css";

interface StudyCardProps {
  study: StudySummary;
}

/** The icon of each kind of study, by its catalog code. */
const KIND_ICONS: Record<string, ComponentType<IconProps>> = {
  [DATABASE_KIND.MY_GAMES]: UserIcon,
  [DATABASE_KIND.STUDY]: BookOpenIcon,
  [DATABASE_KIND.TOURNAMENT]: TrophyIcon,
  [DATABASE_KIND.COLLECTION]: BooksIcon,
};

/** The icon of where a study that is not theirs comes from. */
const ORIGIN_ICONS: Record<StudyOrigin["code"], ComponentType<IconProps>> = {
  COURSE: GraduationCapIcon,
  TEACHER: ChalkboardUserIcon,
  CLASSES: UsersIcon,
};

/**
 * A study as the library shows it (2026-10-07, the «Biblioteca» direction):
 * its board on the left — where its first game ends —, and beside it its kind,
 * its name in two lines at most, how many games it has and when it was last
 * touched. A study that is not theirs says where it comes from instead of its
 * kind. The whole card takes you to the study: the name is the link, and a
 * pseudo-element of it is stretched over the card (see the stylesheet), which
 * keeps one link in the markup and the delete button, raised above it, still
 * pressable.
 */
export function StudyCard({ study }: StudyCardProps) {
  const Icon = study.origin ? ORIGIN_ICONS[study.origin.code] : (KIND_ICONS[study.kindCode] ?? BookOpenIcon);

  return (
    <article className="study-card">
      {/* A thumbnail: the name says what the study is, so the board is not read out. */}
      <span className="study-card__board" aria-hidden="true">
        <StaticDiagram fen={study.boardFen} orientation={study.boardOrientation} />
      </span>

      <div className="study-card__body">
        <span className={`study-card__kind${study.origin ? " study-card__kind_received" : ""}`}>
          <Icon variant="classic-solid" className="study-card__kind-icon" />
          <span className="study-card__kind-label">{study.origin?.label ?? study.kindLabel}</span>
        </span>

        <Link href={study.href} className="study-card__name">
          {study.name}
        </Link>

        <span className="study-card__meta">
          {study.gameCount} {study.gameCount === 1 ? "partida" : "partidas"} ·{" "}
          <span title={`Actualizado el ${study.updatedAtLabel}`}>{study.updatedAgoLabel}</span>
        </span>
      </div>

      {study.permissions.canDelete && (
        <div className="study-card__actions">
          <DeleteStudy
            id={study.id}
            name={study.name}
            gameCount={study.gameCount}
            citedGameCount={study.citedGameCount}
          />
        </div>
      )}
    </article>
  );
}
