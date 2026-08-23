import Link from "next/link";
import type { LegalPageContent } from "@/interfaces/legal-page.interface";
import "./legal-page.section.css";

export function LegalPageSection({ title, intro, updatedLabel, cards, closing }: LegalPageContent) {
  return (
    <section className="legal-page">
      <div className="legal-page__glow" />

      <div className="legal-page__section">
        <span className="legal-page__eyebrow">Legal</span>
        <h1 className="legal-page__title">{title}</h1>
        <p className="legal-page__intro">{intro}</p>
        <p className="legal-page__updated">{updatedLabel}</p>

        <div className="legal-page__grid">
          {cards.map((card) => (
            <div
              key={card.title}
              id={card.id}
              className={`legal-page__card${card.highlighted ? " legal-page__card_highlighted" : ""}`}
            >
              <h2 className="legal-page__card-title">{card.title}</h2>
              {card.items ? (
                <ul className="legal-page__card-list">
                  {card.items.map((item) => (
                    <li key={item} className="legal-page__card-list-item">
                      <span className="legal-page__card-list-dot" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                card.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="legal-page__card-text">
                    {paragraph}
                  </p>
                ))
              )}
              {card.action && (
                <Link href={card.action.href} className="legal-page__card-action">
                  {card.action.label}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="legal-page__closing">
          <h2 className="legal-page__card-title">{closing.title}</h2>
          {closing.paragraphs.map((paragraph) => (
            <p key={paragraph} className="legal-page__card-text legal-page__card-text_wide">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
