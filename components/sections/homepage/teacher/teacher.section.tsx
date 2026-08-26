import Link from "next/link";
import Image from "next/image";
import { CalendarCheck } from "lucide-react";
import { EloTable } from "@/components/common/elo-table.comp";
import { ChessBoard } from "@/components/common/chess-board.comp";
import type { MoveAnnotations } from "@/hooks/use-chess-replay.hook";
import { TeacherStat } from "./teacher-stat.comp";
import "./teacher.section.css";

interface TeacherSectionProps {
  eyebrow: string;
  name: string;
  badge: string;
  summary: string;
  photoUrl: string;
  ctaLabel: string;
  stats: { value: string; label: string }[];
  eloLabel: string;
  eloRatings: { label: string; value: number }[];
  game: {
    title: string;
    paragraphs: { text: string }[];
    moves: string;
    flipBoard?: boolean | null;
    annotations?: MoveAnnotations | null;
  };
}

export function TeacherSection({
  eyebrow,
  name,
  badge,
  summary,
  photoUrl,
  ctaLabel,
  stats,
  eloLabel,
  eloRatings,
  game,
}: TeacherSectionProps) {
  return (
    <section id="maestro">
      <div className="teacher">
        <div className="teacher__media">
          <Image className="teacher__photo" src={photoUrl} alt={name} width={1536} height={2048} />
          <div className="teacher__photo-overlay" />

          <div className="teacher__stats">
            {stats.map((stat) => (
              <TeacherStat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>

        <div className="teacher__content">
          <span className="teacher__eyebrow">{eyebrow}</span>
          <h1 className="teacher__name">{name}</h1>
          <span className="teacher__badge">{badge}</span>
          <p className="teacher__summary">{summary}</p>

          <div className="teacher__stats teacher__stats_variant_mobile">
            {stats.map((stat) => (
              <TeacherStat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>

          <p className="teacher__elo-label">{eloLabel}</p>
          <EloTable className="teacher__elo-table" columns={4}>
            {eloRatings.map((rating) => (
              <EloTable.EloItem key={rating.label} label={rating.label} value={rating.value} />
            ))}
          </EloTable>

          <div className="teacher__actions">
            <Link href="/#planes" className="button button_variant_primary">
              <CalendarCheck size={16} />
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>

      <div className="teacher-game">
        <div className="teacher-game__inner">
          <div className="teacher-game__intro">
            <h2 className="teacher-game__title">{game.title}</h2>
            {game.paragraphs.map((paragraph, index) => (
              <p className="teacher-game__text" key={index}>
                {paragraph.text}
              </p>
            ))}
          </div>

          <ChessBoard
            flipBoard={game.flipBoard ?? false}
            moves={game.moves.split(" ")}
            annotations={game.annotations ?? undefined}
          />
        </div>
      </div>
    </section>
  );
}
