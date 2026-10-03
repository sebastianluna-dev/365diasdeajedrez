"use client";

import { useEffect, useState, useSyncExternalStore, type FocusEvent, type PointerEvent } from "react";
import { PauseIcon } from "@/components/icons/pause-icon.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import type { ReviewContent } from "@/services/home/home.types";
import { ReviewStatCard } from "./review-stat-card.comp";
import { ReviewChat } from "./review-chat.comp";
import { ReviewSlideDot } from "./review-slide-dot.comp";
import "./reviews-interactive.comp.css";

const AUTO_ADVANCE_MS = 6000;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToMotion(onChange: () => void): () => void {
  const media = window.matchMedia(REDUCED_MOTION);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCED_MOTION).matches;
}

type SlidePosition = "center" | "left" | "right";

function getSlidePosition(index: number, activeIndex: number, total: number): SlidePosition {
  const diff = (index - activeIndex + total) % total;
  if (diff === 0) return "center";
  return diff <= total / 2 ? "right" : "left";
}

interface ReviewsInteractiveProps {
  reviews: ReviewContent[];
}

/**
 * The reviews take turns every six seconds, which content that moves on its
 * own may only do with a way to stop it (WCAG 2.2.2): the button beside the
 * dots pauses and plays them. They also hold still while the pointer is over
 * them or the keyboard's focus is inside, so nobody loses a review halfway
 * through reading it, and they start paused for whoever asked the system for
 * less motion (the server assumes they play; `matchMedia` rules once it
 * hydrates). The button's choice, once made, wins over the preference.
 */
export function ReviewsInteractive({ reviews }: ReviewsInteractiveProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [chosen, setChosen] = useState<"playing" | "paused" | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useSyncExternalStore(subscribeToMotion, prefersReducedMotion, () => false);

  const rotates = reviews.length > 1;
  const playing = chosen === null ? !reducedMotion : chosen === "playing";
  const advancing = rotates && playing && !hovered && !focused;

  useEffect(() => {
    if (!advancing) return;
    // A timeout per review rather than an interval: picking a dot, or
    // resuming, gives the review on screen its full six seconds.
    const timeout = setTimeout(() => {
      setActiveIndex((current) => (current + 1) % reviews.length);
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timeout);
  }, [advancing, activeIndex, reviews.length]);

  // A touch also enters and leaves; only a mouse hovers.
  const onPointerHover = (event: PointerEvent<HTMLDivElement>, over: boolean) => {
    if (event.pointerType === "mouse") setHovered(over);
  };

  // The keyboard's focus, not a click's: a dot picked with the mouse keeps its
  // focus after the pointer leaves, and the reviews would stop for good.
  const onFocusIn = (event: FocusEvent<HTMLDivElement>) => {
    setFocused(event.target.matches(":focus-visible"));
  };
  const onFocusOut = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  return (
    <div
      className="reviews__carousel"
      onPointerEnter={(event) => onPointerHover(event, true)}
      onPointerLeave={(event) => onPointerHover(event, false)}
      onFocus={onFocusIn}
      onBlur={onFocusOut}
    >
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

      <div className="reviews__controls">
        {rotates && (
          <button
            type="button"
            className="reviews__toggle"
            aria-label={playing ? "Pausar los testimonios" : "Reproducir los testimonios"}
            onClick={() => setChosen(playing ? "paused" : "playing")}
          >
            {playing ? <PauseIcon className="reviews__toggle-icon" /> : <PlayIcon className="reviews__toggle-icon" />}
          </button>
        )}

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
      </div>
    </div>
  );
}
