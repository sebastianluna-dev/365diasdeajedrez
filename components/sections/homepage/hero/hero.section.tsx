import Link from "next/link";
import Image from "next/image";
import { FloatBadge } from "./float-badge.comp";
import { Orbit } from "./orbit.comp";
import { CHESS_PIECE_UNICODE } from "@/constants/chess-pieces.const";
import { getHeroData } from "@/services/home/home.service";
import "./hero.section.css";

export async function HeroSection() {
  const content = await getHeroData();

  return (
    <section id="inicio" className="hero">
      <div className="hero__inner">
        <div className="hero__glow" />

        <div className="hero__grid">
          <div className="hero__copy">
            <h1 className="hero__title">{content.title}</h1>
            <p className="hero__text">{content.description}</p>
            <div className="hero__actions">
              <Link href={content.cta.href} className="button button_variant_primary button_size_hero">
                {content.cta.label}
              </Link>
            </div>
          </div>

          <div className="hero__visual">
            <div>
              <div className="hero__stage">
                <div className="hero__card">
                  <div className="hero__card-inner">
                    {/* It is the LCP: `preload` announces it in the <head> and `fetchPriority`
                        raises its priority in that preload and in the <img>. `sizes` is
                        what actually renders (the card), not the viewport width: without
                        it, mobile requested twice the pixels. */}
                    <Image
                      src={content.image.src}
                      alt={content.image.alt}
                      width={520}
                      height={640}
                      preload
                      fetchPriority="high"
                      sizes="(max-width: 1024px) 300px, 420px"
                    />
                  </div>
                </div>
                <Orbit />
              </div>
            </div>

            <div className="hero__badges">
              <FloatBadge text="Cálculo" piece={CHESS_PIECE_UNICODE.BLACK_KNIGHT} className="float-badge_offset_1" />
              <FloatBadge text="Visualización" piece={CHESS_PIECE_UNICODE.BLACK_QUEEN} className="float-badge_offset_2" />
              <FloatBadge text="Estrategia" piece={CHESS_PIECE_UNICODE.BLACK_BISHOP} className="float-badge_offset_3" />
              <FloatBadge text="Finales" piece={CHESS_PIECE_UNICODE.BLACK_KING} className="float-badge_offset_3" />
              <FloatBadge text="Aperturas" piece={CHESS_PIECE_UNICODE.BLACK_PAWN} className="float-badge_offset_2" />
              <FloatBadge text="Partidas" piece={CHESS_PIECE_UNICODE.BLACK_ROOK} className="float-badge_offset_1" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
