"use client";

import { useEffect, useState } from "react";
import type { ReviewContent } from "@/services/home/home.types";
import { ReviewStatCard } from "./review-stat-card.comp";
import { ReviewChat } from "./review-chat.comp";
import { ReviewSlideDot } from "./review-slide-dot.comp";
import "./reviews-interactive.comp.css";

const AUTO_ADVANCE_MS = 6000;

type SlidePosition = "center" | "left" | "right";

function getSlidePosition(index: number, activeIndex: number, total: number): SlidePosition {
  const diff = (index - activeIndex + total) % total;
  if (diff === 0) return "center";
  return diff <= total / 2 ? "right" : "left";
}

interface ReviewsInteractiveProps {
  reviews: ReviewContent[];
}

export function ReviewsInteractive({ reviews }: ReviewsInteractiveProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % reviews.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [activeIndex, reviews.length]);

  return (
    <>
      <div className="reviews__showcase">
        <div className="reviews__stat-stack">
          {reviews.map((item, index) => (
            <ReviewStatCard
              key={item.name}
              stat={item.stat}
              position={getSlidePosition(index, activeIndex, reviews.length)}
              hidden={index !== activeIndex}
            />
          ))}
        </div>

        <div className="reviews__chat-stack">
          {reviews.map((item, index) => (
            <ReviewChat
              key={item.name}
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
            key={item.name}
            label={`Ver testimonio de ${item.name}`}
            active={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </>
  );
}
