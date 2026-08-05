import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "../../../layout/SiteHeader";
import { FloatBadge } from "./FloatBadge";
import { Orbit } from "./Orbit";
import { ChessPieceUnicode } from "@/enums/chessPieces";
import "./hero.css";

export function HeroSection() {
  return (
    <div className="hero">
      <section id="inicio" className="hero__inner">
        <div className="hero__glow" />
        <div className="hero__header">
          <SiteHeader />
        </div>

        <div className="hero__grid">
          <div>
            <h1 className="hero__title">El verdadero progreso en ajedrez se gana entrenando.</h1>
            <p className="hero__text">
              Prueba el Método 365: cinco módulos progresivos que te llevan de los fundamentos a los finales, con un
              plan hecho a tu nivel y a tu ritmo.
            </p>
            <div className="hero__actions">
              <Link href="/#planes" className="button button_variant_primary">
                Únete a la academia
              </Link>
              <Link href="/#programa" className="button button_variant_secondary">
                Conoce el método
              </Link>
            </div>
          </div>

          <div className="hero__visual">
            <div>
              <div className="hero__stage">
                <div className="hero__card" style={{ gridArea: "1 / 1 / 2 / 2" }}>
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
              <FloatBadge text="Visualizacion" piece={ChessPieceUnicode.BlackQueen} className="float-badge_offset_2" />
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
