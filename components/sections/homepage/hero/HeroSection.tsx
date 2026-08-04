import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "../../../layout/SiteHeader";
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
                <div
                  className="orbit1 relative"
                  style={{ gridArea: "1 / 1 / 2 / 2" }}
                >
                  <div className="w-2 h-2 bg-primary rotate-0 absolute rounded-full -top-[5px] right-1/2"></div>
                  <div className="w-1.5 h-1.5 bg-secondary rotate-0 absolute rounded-full top-1/2 -right-[4px]"></div>
                  <div className="w-1.5 h-1.5 bg-white rotate-0 absolute rounded-full right-1/2 -bottom-[5px]"></div>
                </div>

                <div className="orbit2" style={{ gridArea: "1 / 1 / 2 / 2" }}>
                  <div className="w-2 h-2 bg-white rotate-0 absolute rounded-full -top-[5px] right-1/2"></div>
                  <div className="w-1.5 h-1.5 bg-white rotate-0 absolute rounded-full -bottom-[5px] right-1/2"></div>
                </div>
              </div>
            </div>

            <div className="floatBadge one">Visualización</div>
            <div className="floatBadge two">Medio juego</div>
            <div className="floatBadge three">Finales</div>
          </div>
        </div>
      </section>
    </div>
  );
}
