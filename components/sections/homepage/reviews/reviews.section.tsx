import { reviews } from "@/data/reviews.data";
import "./reviews.section.css";

export function ReviewsSection() {
  const review = reviews[0];

  return (
    <section className="section section_theme_light reviews">
      <div className="section__inner">
        <div className="reviews__head">
          <h2 className="reviews__title">Lo que dicen los alumnos</h2>
          <div className="reviews__divider" />
        </div>

        <div className="reviews__showcase">
          <div className="reviews__stat">
            <span className="reviews__stat-label">{review.stat.label}</span>
            <strong className="reviews__stat-value">{review.stat.value}</strong>
            <p className="reviews__stat-text">{review.stat.text}</p>
          </div>

          <div className="reviews__chat">
            <div className="reviews__chat-header">
              <span className="reviews__chat-avatar">{review.avatarInitial}</span>
              <strong className="reviews__chat-name">{review.name}</strong>
              <span className="reviews__chat-time">{review.time}</span>
            </div>

            <div className="reviews__chat-body">
              {review.messagesBeforeReaction.map((message) => (
                <p key={message}>{message}</p>
              ))}
              <span className="reviews__chat-reaction">♥ {review.reactionCount}</span>
              {review.messagesAfterReaction.map((message) => (
                <p key={message}>{message}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
