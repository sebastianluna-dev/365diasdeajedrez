"use client";

import { useState } from "react";
import Link from "next/link";
import { subscriptionPlans } from "@/data/subscription-plans.data";
import { CircleCheckIcon } from "@/components/icons/circle-check-icon.comp";
import "./plans-mobile.section.css";

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
        <div className="plan-card__price-row">
          <span className="plan-card__price">${activePlan.price.toLocaleString("en-US")}</span>
          <span className="muted-text">
            {activePlan.currency} / {activePlan.period}
          </span>
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
          href="/#planes"
          className={`plan-card__button${activePlan.featured ? " plan-card__button_variant_alt" : ""}`}
        >
          {activePlan.ctaLabel}
        </Link>
      </div>
    </div>
  );
}
