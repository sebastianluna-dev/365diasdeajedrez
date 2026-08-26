import Link from "next/link";
import Image from "next/image";
import { FloatBadge } from "./float-badge.comp";
import { Orbit } from "./orbit.comp";
import { ChessPieceUnicode } from "@/enums/chess-pieces.enum";
import "./hero.section.css";

interface HeroSectionProps {
  title: string;
  description: string;
  imageUrl: string;
  cta: {
    label: string;
    href: string;
  };
}

export function HeroSection({ title, description, imageUrl, cta }: HeroSectionProps) {
  return (
    <section id="inicio" className="hero">
      <div className="hero__inner">
        <div className="hero__glow" />

        <div className="hero__grid">
          <div className="hero__copy">
            <h1 className="hero__title">{title}</h1>
            <p className="hero__text">{description}</p>
            <div className="hero__actions">
              <Link href={cta.href} className="button button_variant_primary button_size_hero">
                {cta.label}
              </Link>
            </div>
          </div>

          <div className="hero__visual">
            <div>
              <div className="hero__stage">
                <div className="hero__card">
                  <div className="hero__card-inner">
                    <Image src={imageUrl} alt="Jugador entrenando ajedrez" width={520} height={640} priority />
                  </div>
                </div>
                <Orbit />
              </div>
            </div>

            <div className="hero__badges">
              <FloatBadge text="Cálculo" piece={ChessPieceUnicode.BlackKnight} className="float-badge_offset_1" />
              <FloatBadge text="Visualización" piece={ChessPieceUnicode.BlackQueen} className="float-badge_offset_2" />
              <FloatBadge text="Estrategia" piece={ChessPieceUnicode.BlackBishop} className="float-badge_offset_3" />
              <FloatBadge text="Finales" piece={ChessPieceUnicode.BlackKing} className="float-badge_offset_3" />
              <FloatBadge text="Aperturas" piece={ChessPieceUnicode.BlackPawn} className="float-badge_offset_2" />
              <FloatBadge text="Partidas" piece={ChessPieceUnicode.BlackRook} className="float-badge_offset_1" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
