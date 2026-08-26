"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import type { PackagePlanContent } from "@/services/home/home.types";
import "./plans-mobile.comp.css";

interface PlansMobileSectionProps {
  plans: PackagePlanContent[];
}

export function PlansMobileSection({ plans }: PlansMobileSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activePlan = plans[activeIndex];

  return (
    <div className="plans-mobile">
      <div className="plans-mobile__tabs">
        {plans.map((plan, index) => (
          <button
            key={plan.name}
            type="button"
            className={`plans-mobile__tab${index === activeIndex ? " plans-mobile__tab_active" : ""}`}
            onClick={() => setActiveIndex(index)}
          >
            {plan.name}
          </button>
        ))}
      </div>

      <div className={`plan-card plans-mobile__card${activePlan.featured ? " plan-card_featured" : ""}`}>
        <h3 className="plan-card__title">{activePlan.name}</h3>
        <div className="plan-card__price-block">
          <div className="plan-card__price-row">
            <span className="plan-card__price">${activePlan.price.toLocaleString("en-US")}</span>
            <span className="muted-text">
              {activePlan.currency} / {activePlan.period}
            </span>
          </div>
          {!!activePlan.previousPrice && (
            <div className="plan-card__discount-row">
              <span className="plan-card__price-previous">
                ${activePlan.previousPrice.toLocaleString("en-US")} {activePlan.currency}
              </span>
              {!!activePlan.discountPercent && (
                <span className="plan-card__discount-badge">{activePlan.discountPercent}% OFF</span>
              )}
            </div>
          )}
        </div>
        <p className="plan-card__description">{activePlan.description}</p>
        <ul className="plan-card__list">
          {activePlan.features.map((feature, index) => (
            <li key={index} className="plan-card__list-item">
              <CircleCheckIcon className="plan-card__list-icon" />
              {feature}
            </li>
          ))}
        </ul>
        <Link
          href={`https://wa.me/522291348338?text=${encodeURIComponent(
            `Hola, me gustaría recibir información sobre el ${activePlan.name} de la Academia 365 Días de Ajedrez. ¡Gracias!`,
          )}`}
          target="_blank"
          className={`plan-card__button${activePlan.featured ? " plan-card__button_variant_alt" : ""}`}
        >
          {activePlan.ctaLabel}
        </Link>
      </div>
    </div>
  );
}
