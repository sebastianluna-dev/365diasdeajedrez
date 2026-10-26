"use client";

import { useId, useState } from "react";
import { PlusIcon } from "@/components/icons/plus-icon.comp";
import { XmarkIcon } from "@/components/icons/xmark-icon.comp";
import type { FaqQuestionContent } from "@/services/home/home.types";
import "./faq-accordion.comp.css";

interface FaqAccordionProps {
  questions: FaqQuestionContent[];
}

/**
 * The questions as an accordion, one open at a time (the first, when the page
 * opens): each question is a button with `aria-expanded` that controls its
 * answer, and pressing the open one closes it. The only state of the FAQ, so
 * the only client piece of its section.
 */
export function FaqAccordion({ questions }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();

  return (
    <ul className="faq-accordion">
      {questions.map((item, index) => {
        const expanded = open === index;
        const answerId = `${id}-respuesta-${index}`;
        return (
          <li key={item.question} className={`faq-accordion__item${expanded ? " faq-accordion__item_state_open" : ""}`}>
            <h3 className="faq-accordion__heading">
              <button
                type="button"
                className="faq-accordion__question"
                aria-expanded={expanded}
                aria-controls={answerId}
                onClick={() => setOpen(expanded ? null : index)}
              >
                <span className="faq-accordion__text">{item.question}</span>
                <span className="faq-accordion__icon">
                  {expanded ? <XmarkIcon variant="classic-solid" /> : <PlusIcon />}
                </span>
              </button>
            </h3>
            <p id={answerId} className="faq-accordion__answer" hidden={!expanded}>
              {item.answer}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
