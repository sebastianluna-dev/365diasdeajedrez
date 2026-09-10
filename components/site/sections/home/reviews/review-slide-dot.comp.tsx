import "./review-slide-dot.comp.css";

interface ReviewSlideDotProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function ReviewSlideDot({ label, active, onClick }: ReviewSlideDotProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`reviews__dot${active ? " reviews__dot_active" : ""}`}
    >
      {/* The visible part; the button wrapping it is the press area. */}
      <span className="reviews__dot-pill" aria-hidden="true" />
    </button>
  );
}
