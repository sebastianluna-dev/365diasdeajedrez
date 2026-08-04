import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "../../../layout/SiteHeader";
import { FloatBadge } from "./FloatBadge";
import { Orbit } from "./Orbit";
import { ChessPieceUnicode } from "@/enums/chessPieces";
import "./hero.css";

export function HeroSection() {
  return (
    <div className="landingWrap">
      <section id="inicio" className="heroSection">
        <div className="heroGlow" />
        <div className="siteHeader">
          <SiteHeader />
        </div>

        <div className="heroGrid">
          <div className="heroCopy">
            <h1>El verdadero progreso en ajedrez se gana entrenando.</h1>
            <p>
              Prueba el Método 365: cinco módulos progresivos que te llevan de
              los fundamentos a los finales, con un plan hecho a tu nivel y a tu
              ritmo.
            </p>
            <div className="heroActions">
              <Link href="/#planes" className="primaryBtn">
                Únete a la academia
              </Link>
              <Link href="/#programa" className="secondaryBtn">
                Conoce el método
              </Link>
            </div>
          </div>

          <div className="heroVisual">
            <div>
              <div className="grid">
                <div
                  className="heroCard p-14"
                  style={{ gridArea: "1 / 1 / 2 / 2" }}
                >
                  <div className="heroCardInner">
                    <Image
                      src="/design-import/assets/hero-jugador.png"
                      alt="Jugador entrenando ajedrez"
                      width={520}
                      height={640}
                      priority
                      className="rounded-full w-full h-auto"
                    />
                  </div>
                </div>
                <Orbit />
              </div>
            </div>

            <FloatBadge text="Cálculo" piece={ChessPieceUnicode.BlackKnight} />
            <div className="floatBadge two">Medio juego</div>
            <div className="floatBadge three">Finales</div>
          </div>
        </div>
      </section>
    </div>
  );
}
