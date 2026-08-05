import Link from "next/link";
import { subscriptionPlans } from "@/data/subscription-plans.data";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import "./plans.section.css";

export function PlansSection() {
  return (
    <section id="planes" className="section section_theme_light plans">
      <div className="section__inner">
        <div className="section__head plans__head">
          <div>
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
              <div className="plan-card__price-row">
                <span className="plan-card__price">${plan.price.toLocaleString("en-US")}</span>
                <span className="muted-text">
                  {plan.currency} / {plan.period}
                </span>
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
                href="/#planes"
                className={`plan-card__button${plan.featured ? " plan-card__button_variant_alt" : ""}`}
              >
                {plan.ctaLabel}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
