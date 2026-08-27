import { HeartIcon } from "@/components/icons/heart-icon.comp";
import type { ReviewContent } from "@/services/home/home.types";
import "./review-chat.comp.css";

interface ReviewChatProps {
  review: ReviewContent;
  position: "center" | "left" | "right";
  hidden: boolean;
}

export function ReviewChat({ review, position, hidden }: ReviewChatProps) {
  return (
    <div aria-hidden={hidden} className={`reviews__chat reviews__chat_position_${position}`}>
      <div className="reviews__chat-header">
        <span className={`reviews__chat-avatar reviews__chat-avatar_color_${review.avatarColor}`}>
          {review.avatarInitial}
        </span>
        <strong className="reviews__chat-name">{review.name}</strong>
        <span className="reviews__chat-time">{review.time}</span>
      </div>

      <div className="reviews__chat-body">
        {review.messages.map((message, index) => (
          <div
            key={index}
            className={`reviews__chat-message${message.reacted ? " reviews__chat-message_reacted" : ""}`}
          >
            <p>{message.text}</p>
            {message.reacted && (
              <span className="reviews__chat-reaction">
                <HeartIcon />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
