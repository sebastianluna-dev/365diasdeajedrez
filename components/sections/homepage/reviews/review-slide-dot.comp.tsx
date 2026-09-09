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
      {/* Lo visible; el botón que lo envuelve es la zona que se pulsa. */}
      <span className="reviews__dot-pill" aria-hidden="true" />
    </button>
  );
}
