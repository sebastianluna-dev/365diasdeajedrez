import Link from "next/link";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import { PlansMobileSection } from "./plans-mobile.comp";
import "./plans.section.css";

interface PlanData {
  name: string;
  price: number;
  previousPrice?: number | null;
  discountPercent?: number | null;
  currency: string;
  period: string;
  description: string;
  features: { text: string }[];
  ctaLabel: string;
  featured?: boolean | null;
}

interface PlansSectionProps {
  sectionTitle: string;
  sectionDescription: string;
  plans: PlanData[];
}

export function PlansSection({ sectionTitle, sectionDescription, plans }: PlansSectionProps) {
  const maxDiscountPercent = Math.max(...plans.map((plan) => plan.discountPercent ?? 0));

  return (
    <section id="planes" className="section section_theme_light plans">
      <div className="section__inner">
        <div className="section__head plans__head">
          <div>
            {maxDiscountPercent > 0 && (
              <span className="section__eyebrow">Ahorra hasta {maxDiscountPercent}% en tu mensualidad</span>
            )}
            <h2 className="section__title">{sectionTitle}</h2>
            <p className="section__text">{sectionDescription}</p>
          </div>
        </div>

        <div className="plans__wrap">
          {plans.map((plan) => (
            <div key={plan.name} className={`plan-card${plan.featured ? " plan-card_featured" : ""}`}>
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
                {plan.features.map((feature, index) => (
                  <li key={index} className="plan-card__list-item">
                    <CircleCheckIcon className="plan-card__list-icon" />
                    {feature.text}
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

        <PlansMobileSection plans={plans} />
      </div>
    </section>
  );
}
