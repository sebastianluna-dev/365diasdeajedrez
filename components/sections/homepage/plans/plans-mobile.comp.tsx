"use client";

import { useState } from "react";
import Link from "next/link";
import { subscriptionPlans } from "@/data/subscription-plans.data";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import "./plans-mobile.comp.css";

export function PlansMobileSection() {
  const [activeSlug, setActiveSlug] = useState(subscriptionPlans[0].slug);
  const activePlan = subscriptionPlans.find((plan) => plan.slug === activeSlug) ?? subscriptionPlans[0];

  return (
    <div className="plans-mobile">
      <div className="plans-mobile__tabs">
        {subscriptionPlans.map((plan) => (
          <button
            key={plan.slug}
            type="button"
            className={`plans-mobile__tab${plan.slug === activeSlug ? " plans-mobile__tab_active" : ""}`}
            onClick={() => setActiveSlug(plan.slug)}
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
          {activePlan.features.map((feature) => (
            <li key={feature} className="plan-card__list-item">
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
