import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/sections/common/header/header.section";
import { Footer } from "@/components/sections/common/footer/footer.section";
import { EloTable } from "@/components/common/elo-table.comp";
import { ChessBoard } from "@/components/common/chess-board.comp";
import { getMentorBySlug, getMentorsData } from "@/services/mentors/mentors.service";
import "./mentor-page.css";

interface MentorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { mentors } = await getMentorsData();
  return mentors.map((mentor) => ({ slug: mentor.slug }));
}

export async function generateMetadata({ params }: MentorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const mentor = await getMentorBySlug(slug);
  if (!mentor) return {};
  return {
    title: `${mentor.name} ${mentor.lastName} | 365 Días de Ajedrez`,
    description: mentor.shortDescription,
  };
}

export default async function MentorPage({ params }: MentorPageProps) {
  const { slug } = await params;
  const mentor = await getMentorBySlug(slug);
  if (!mentor) notFound();

  const fullName = `${mentor.name} ${mentor.lastName}`;

  return (
    <div className="mentor-page">
      <Header />

      <section className="section section_theme_dark mentor-profile">
        <div className="section__inner mentor-profile__layout">
          <aside className="mentor-profile__sidebar">
            <div className="mentor-profile__photo">
              <span className="mentor-profile__photo-badge">Mentor</span>
              <Image src={mentor.photo.src} alt={mentor.photo.alt} fill sizes="(max-width: 1023px) 100vw, 340px" />
              <div className="mentor-profile__photo-overlay" />
            </div>

            <span className="mentor-profile__eyebrow">Hola, soy</span>
            <h1 className="mentor-profile__name">{fullName}</h1>
            {mentor.fideInfo.longFideTitle && (
              <span className="mentor-profile__badge">{mentor.fideInfo.longFideTitle}</span>
            )}
            <p className="mentor-profile__summary">{mentor.summary}</p>

            <div className="mentor-profile__divider" />

            <span className="mentor-profile__elo-label">Clasificación Elo actual</span>
            <EloTable className="mentor-profile__elo-table" columns={2}>
              <EloTable.EloItem label="Estándar" value={mentor.fideInfo.standardElo} />
              <EloTable.EloItem label="Rápidas" value={mentor.fideInfo.rapidElo} />
              <EloTable.EloItem label="Blitz" value={mentor.fideInfo.blitzElo} />
              {mentor.fideInfo.chessComElo !== undefined && (
                <EloTable.EloItem label="Chess.com" value={mentor.fideInfo.chessComElo} />
              )}
            </EloTable>
          </aside>

          <div className="mentor-profile__content">
            {mentor.achievements.length > 0 && (
              <div className="mentor-profile__block">
                <h2 className="mentor-profile__block-title">Logros</h2>
                <ul className="mentor-achievements__list">
                  {mentor.achievements.map((achievement, index) => (
                    <li key={index} className="mentor-achievements__item">
                      <span className="mentor-achievements__year">{achievement.year}</span>
                      <div>
                        <h3 className="mentor-achievements__title">{achievement.title}</h3>
                        <p className="mentor-achievements__text">{achievement.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {mentor.testimonials.length > 0 && (
              <div className="mentor-profile__block">
                <h2 className="mentor-profile__block-title">Testimonios</h2>
                <div className="mentor-testimonials__grid">
                  {mentor.testimonials.map((testimonial, index) => (
                    <div key={index} className="mentor-testimonials__card">
                      <p className="mentor-testimonials__text">{testimonial.text}</p>
                      <span className="mentor-testimonials__name">{testimonial.name}</span>
                      <span className="mentor-testimonials__detail">{testimonial.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mentor-profile__block">
              <h2 className="mentor-profile__block-title">{mentor.featuredGame.gameTitle}</h2>
              <p className="mentor-profile__text">{mentor.featuredGame.gameText}</p>
              <p className="mentor-profile__text">{mentor.featuredGame.gameNote}</p>
              <ChessBoard pgn={mentor.featuredGame.moves} flipBoard={mentor.featuredGame.flipBoard} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
