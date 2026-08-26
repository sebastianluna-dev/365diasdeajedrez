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
        <div className="section__inner mentor-profile__inner">
          <div className="mentor-profile__photo">
            <Image src={mentor.photo.src} alt={mentor.photo.alt} fill sizes="(max-width: 720px) 100vw, 420px" />
          </div>
          <div className="mentor-profile__info">
            <span className="section__eyebrow">{mentor.city}</span>
            <h1 className="section__title mentor-profile__name">{fullName}</h1>
            {mentor.fideInfo.longFideTitle && (
              <span className="mentor-profile__badge">{mentor.fideInfo.longFideTitle}</span>
            )}
            <p className="section__text mentor-profile__summary">{mentor.summary}</p>

            <EloTable className="mentor-profile__elo-table" columns={mentor.fideInfo.chessComElo ? 4 : 3}>
              <EloTable.EloItem label="Estándar" value={mentor.fideInfo.standardElo} />
              <EloTable.EloItem label="Rápidas" value={mentor.fideInfo.rapidElo} />
              <EloTable.EloItem label="Blitz" value={mentor.fideInfo.blitzElo} />
              {mentor.fideInfo.chessComElo !== undefined && (
                <EloTable.EloItem label="Chess.com" value={mentor.fideInfo.chessComElo} />
              )}
            </EloTable>
          </div>
        </div>
      </section>

      {mentor.achievements.length > 0 && (
        <section className="section section_theme_light mentor-achievements">
          <div className="section__inner">
            <h2 className="section__title">Logros</h2>
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
        </section>
      )}

      {mentor.testimonials.length > 0 && (
        <section className="section section_theme_dark mentor-testimonials">
          <div className="section__inner">
            <h2 className="section__title">Testimonios</h2>
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
        </section>
      )}

      <section className="section section_theme_light mentor-game">
        <div className="section__inner mentor-game__inner">
          <div className="mentor-game__intro">
            <h2 className="section__title">{mentor.featuredGame.gameTitle}</h2>
            <p className="section__text">{mentor.featuredGame.gameText}</p>
            <p className="section__text">{mentor.featuredGame.gameNote}</p>
          </div>

          <ChessBoard moves={mentor.featuredGame.moves} flipBoard={mentor.featuredGame.flipBoard} />
        </div>
      </section>

      <Footer />
    </div>
  );
}
