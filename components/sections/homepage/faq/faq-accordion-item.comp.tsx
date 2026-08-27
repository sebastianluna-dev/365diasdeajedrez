"use client";

import { useState } from "react";
import { PlusIcon } from "@/components/icons/plus-icon.comp";
import type { FaqQuestionContent } from "@/services/home/home.types";
import "./faq-accordion-item.comp.css";

interface FaqAccordionItemProps {
  faq: FaqQuestionContent;
}

export function FaqAccordionItem({ faq }: FaqAccordionItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <article className={`faq-item${open ? " faq-item_open" : ""}`}>
      <button
        type="button"
        className="faq-item__toggle"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <strong className="faq-item__question">{faq.question}</strong>
        <PlusIcon className="faq-item__icon" />
      </button>
      <div className="faq-item__answer-wrap">
        <div className="faq-item__answer-inner">
          <p className="faq-item__answer">{faq.answer}</p>
        </div>
      </div>
    </article>
  );
}
