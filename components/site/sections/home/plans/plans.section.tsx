import { getPackagesData } from "@/services/home/home.service";
import { PlanCard } from "./plan-card/plan-card.comp";
import { PlansMobileSection } from "./plans-mobile.comp";
import "./plans.section.css";

export async function PlansSection() {
  const content = await getPackagesData();

  return (
    <section id="planes" className="section section_theme_light plans">
      <div className="section__inner">
        <div className="section__head plans__head">
          <div>
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
