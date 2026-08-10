import Link from "next/link";
import Image from "next/image";
import { FloatBadge } from "./float-badge.comp";
import { Orbit } from "./orbit.comp";
import { ChessPieceUnicode } from "@/enums/chess-pieces.enum";
import "./hero.section.css";

export function HeroSection() {
  return (
    <div className="hero">
      <section id="inicio" className="hero__inner">
        <div className="hero__glow" />

        <div className="hero__grid">
          <div className="hero__copy">
            <h1 className="hero__title">Lleva tu ajedrez al siguiente nivel con el Método 365</h1>
            <p className="hero__text">
              Desarrolla una comprensión más profunda del juego, aprende a evaluar posiciones y toma mejores decisiones
              sobre el tablero.
            </p>
            <div className="hero__actions">
              <Link href="/#programa" className="button button_variant_primary button_size_hero">
                Conocer el método
              </Link>
            </div>
          </div>

          <div className="hero__visual">
            <div>
              <div className="hero__stage">
                <div className="hero__card">
                  <div className="hero__card-inner">
                    <Image
                      src="/design-import/assets/hero-jugador.png"
                      alt="Jugador entrenando ajedrez"
                      width={520}
                      height={640}
                      priority
                    />
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
      </section>
    </div>
  );
}
