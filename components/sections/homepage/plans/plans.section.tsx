import { getPackagesData } from "@/services/home/home.service";
import { PlanCard } from "./plan-card.comp";
import { PlansMobileSection } from "./plans-mobile.comp";
import "./plans.section.css";

export async function PlansSection() {
  const content = await getPackagesData();
  const maxDiscountPercent = Math.max(...content.plans.map((plan) => plan.discountPercent ?? 0));

  return (
    <section id="planes" className="section section_theme_light plans">
      <div className="section__inner">
        <div className="section__head plans__head">
          <div>
            {maxDiscountPercent > 0 && (
              <span className="section__eyebrow">Ahorra hasta {maxDiscountPercent}% en tu mensualidad</span>
            )}
            <h2 className="section__title">{content.sectionTitle}</h2>
            <p className="section__text">{content.sectionDescription}</p>
          </div>
        </div>

        <div className="plans__wrap">
          {content.plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <PlansMobileSection plans={content.plans} />
      </div>
    </section>
  );
}
