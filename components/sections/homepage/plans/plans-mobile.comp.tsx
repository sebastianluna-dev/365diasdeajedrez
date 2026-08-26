"use client";

import { useState } from "react";
import type { PackagePlanContent } from "@/services/home/home.types";
import { PlanCard } from "./plan-card.comp";
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

      <PlanCard plan={activePlan} className="plans-mobile__card" />
    </div>
  );
}
