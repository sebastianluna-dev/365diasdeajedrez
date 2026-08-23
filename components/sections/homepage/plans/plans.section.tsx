import Link from "next/link";
import { subscriptionPlans } from "@/data/subscription-plans.data";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { PlansMobileSection } from "./plans-mobile.comp";
import "./plans.section.css";

const maxDiscountPercent = Math.max(...subscriptionPlans.map((plan) => plan.discountPercent ?? 0));

export function PlansSection() {
  return (
    <section id="planes" className="section section_theme_light plans">
      <div className="section__inner">
        <div className="section__head plans__head">
          <div>
            {maxDiscountPercent > 0 && (
              <span className="section__eyebrow">Ahorra hasta {maxDiscountPercent}% en tu mensualidad</span>
            )}
            <h2 className="section__title">Paquetes</h2>
            <p className="section__text">
              Entrena una vez por semana o duplica el ritmo.
            </p>
          </div>
        </div>

        <div className="plans__wrap">
          {subscriptionPlans.map((plan) => (
            <div key={plan.slug} className={`plan-card${plan.featured ? " plan-card_featured" : ""}`}>
              <h3 className="plan-card__title">{plan.name}</h3>
              <div className="plan-card__price-block">
                <div className="plan-card__price-row">
                  <span className="plan-card__price">${plan.price.toLocaleString("en-US")}</span>
                  <span className="muted-text">
                    {plan.currency} / {plan.period}
                  </span>
                </div>
                {!!plan.previousPrice && (
                  <div className="plan-card__discount-row">
                    <span className="plan-card__price-previous">
                      ${plan.previousPrice.toLocaleString("en-US")} {plan.currency}
                    </span>
                    {!!plan.discountPercent && (
                      <span className="plan-card__discount-badge">{plan.discountPercent}% OFF</span>
                    )}
                  </div>
                )}
              </div>
              <p className="plan-card__description">{plan.description}</p>
              <ul className="plan-card__list">
                {plan.features.map((feature) => (
                  <li key={feature} className="plan-card__list-item">
                    <CircleCheckIcon className="plan-card__list-icon" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href={`https://wa.me/522291348338?text=${encodeURIComponent(
                  `Hola, me gustaría recibir información sobre el ${plan.name} de la Academia 365 Días de Ajedrez. ¡Gracias!`,
                )}`}
                target="_blank"
                className={`plan-card__button${plan.featured ? " plan-card__button_variant_alt" : ""}`}
              >
                {plan.ctaLabel}
              </Link>
            </div>
          ))}
        </div>

        <PlansMobileSection />
      </div>
    </section>
  );
}
