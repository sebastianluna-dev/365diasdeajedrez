import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "../../layout/SiteHeader";

const badges = ["Cálculo", "Estrategia", "Aperturas", "Finales"];

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
            <div className="sectionEyebrow">Método 365</div>
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
            <div className="badgesRow">
              {badges.map((badge) => (
                <span key={badge} className="badgePill">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="heroVisual">
            <div className="orbit1" />
            <div className="orbit2" />
            <div className="orbit3" />
            <div className="heroCard">
              <div className="heroCardInner">
                <Image
                  src="/design-import/assets/hero-jugador.png"
                  alt="Jugador entrenando ajedrez"
                  width={520}
                  height={640}
                  priority
                />
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
