import Link from "next/link";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import type { PackagePlanContent } from "@/services/home/home.types";
import "./plan-card.comp.css";

interface PlanCardProps {
  /** One plan of the `home-packages` Global, already mapped by services/home. */
  plan: PackagePlanContent;
  /** Extra class on the block; the mobile wrapper passes `plans-mobile__card`. */
  className?: string;
}

/**
 * One pricing card. `plan.featured` adds the `_featured` modifier and the
 * alternative button, so the highlighted plan is a CMS flag rather than a
 * second component. Inherits its text colour from the surrounding
 * `.section_theme_light`.
 */
export function PlanCard({ plan, className }: PlanCardProps) {
  return (
    <div className={`plan-card${plan.featured ? " plan-card_featured" : ""}${className ? ` ${className}` : ""}`}>
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
          </div>
        )}
      </div>
      <p className="plan-card__description">{plan.description}</p>
      <ul className="plan-card__list">
        {plan.features.map((feature, index) => (
          <li key={index} className="plan-card__list-item">
            <CircleCheckIcon className="plan-card__list-icon" />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={plan.ctaUrl}
        target="_blank"
        className={`plan-card__button${plan.featured ? " plan-card__button_variant_alt" : ""}`}
      >
        {plan.ctaLabel}
      </Link>
    </div>
  );
}
