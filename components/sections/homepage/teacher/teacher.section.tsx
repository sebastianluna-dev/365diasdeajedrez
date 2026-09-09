import Link from "next/link";
import Image from "next/image";
import { CalendarCheck } from "lucide-react";
import { EloTable } from "@/components/common/elo-table.comp";
import { ChessBoardLazy } from "@/components/common/chess-board-lazy.comp";
import { getTeacherData } from "@/services/home/home.service";
import { TeacherStat } from "./teacher-stat.comp";
import "./teacher.section.css";

export async function TeacherSection() {
  const content = await getTeacherData();

  return (
    <section id="maestro">
      <div className="teacher">
        <div className="teacher__media">
          {/* `sizes` sigue al CSS de .teacher__media: ancho completo en móvil,
              56 % en tablet, 480 px en escritorio. Sin él el navegador asumía
              el ancho del viewport y pedía la foto a 3840 px (725 KB). */}
          <Image
            className="teacher__photo"
            src={content.photo.src}
            alt={content.photo.alt}
            width={content.photo.width ?? 1536}
            height={content.photo.height ?? 2048}
            sizes="(max-width: 720px) 100vw, (max-width: 1023px) 56vw, 480px"
          />
          <div className="teacher__photo-overlay" />

          <div className="teacher__stats">
            {content.stats.map((stat) => (
              <TeacherStat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>

        <div className="teacher__content">
          <span className="teacher__eyebrow">{content.eyebrow}</span>
          <h2 className="teacher__name">{content.name}</h2>
          <span className="teacher__badge">{content.badge}</span>
          <p className="teacher__summary">{content.summary}</p>

          <div className="teacher__stats teacher__stats_variant_mobile">
            {content.stats.map((stat) => (
              <TeacherStat key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>

          <p className="teacher__elo-label">{content.eloLabel}</p>
          <EloTable className="teacher__elo-table" columns={4}>
            {content.eloRatings.map((rating) => (
              <EloTable.EloItem key={rating.label} label={rating.label} value={rating.value} />
            ))}
          </EloTable>

          <div className="teacher__actions">
            <Link href="/#planes" className="button button_variant_primary">
              <CalendarCheck size={16} />
              {content.ctaLabel}
            </Link>
          </div>
        </div>
      </div>

      <div className="teacher-game">
        <div className="teacher-game__inner">
          <div className="teacher-game__intro">
            <h2 className="teacher-game__title">{content.game.title}</h2>
            {content.game.paragraphs.map((paragraph, index) => (
              <p className="teacher-game__text" key={index}>
                {paragraph}
              </p>
            ))}
          </div>

          {/* Diferido: está muy por debajo del pliegue y su JS es lo más pesado de la portada. */}
          <ChessBoardLazy
            flipBoard={content.game.flipBoard}
            pgn={content.game.moves}
            annotations={content.game.annotations}
          />
        </div>
      </div>
    </section>
  );
}
