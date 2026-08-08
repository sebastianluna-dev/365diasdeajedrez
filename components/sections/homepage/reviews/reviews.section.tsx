"use client";

import { useEffect, useState } from "react";
import { reviews } from "@/data/reviews.data";
import { ReviewStatCard } from "./review-stat-card.comp";
import { ReviewChat } from "./review-chat.comp";
import { ReviewSlideDot } from "./review-slide-dot.comp";
import "./reviews.section.css";

const AUTO_ADVANCE_MS = 6000;

type SlidePosition = "center" | "left" | "right";

function getSlidePosition(index: number, activeIndex: number, total: number): SlidePosition {
  const diff = (index - activeIndex + total) % total;
  if (diff === 0) return "center";
  return diff <= total / 2 ? "right" : "left";
}

export function ReviewsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % reviews.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <section id="reviews" className="section section_theme_light reviews">
      <div className="section__inner">
        <div className="reviews__head">
          <h2 className="reviews__title">Lo que dicen los alumnos</h2>
          <div className="reviews__divider" />
        </div>

        <div className="reviews__showcase">
          <div className="reviews__stat-stack">
            {reviews.map((item, index) => (
              <ReviewStatCard
                key={item.slug}
                stat={item.stat}
                position={getSlidePosition(index, activeIndex, reviews.length)}
                hidden={index !== activeIndex}
              />
            ))}
          </div>

          <div className="reviews__chat-stack">
            {reviews.map((item, index) => (
              <ReviewChat
                key={item.slug}
                review={item}
                position={getSlidePosition(index, activeIndex, reviews.length)}
                hidden={index !== activeIndex}
              />
            ))}
          </div>
        </div>

        <div className="reviews__dots">
          {reviews.map((item, index) => (
            <ReviewSlideDot
              key={item.slug}
              label={`Ver testimonio de ${item.name}`}
              active={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
