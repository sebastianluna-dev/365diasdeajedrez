import type { Mentor } from "@/interfaces/mentor.interface";
import { ChessBoard } from "./chess-board.comp";
import "./game.section.css";

interface MentorGameSectionProps {
  mentor: Mentor;
}

export function MentorGameSection({ mentor }: MentorGameSectionProps) {
  return (
    <section className="mentor-game">
      <div className="mentor-game__inner">
        <div className="mentor-game__intro">
          <h2 className="mentor-game__title">{mentor.featuredGame.gameTitle}</h2>
          <p className="mentor-game__text">{mentor.featuredGame.gameText}</p>
        </div>

        <ChessBoard moves={mentor.featuredGame.moves} flipBoard={mentor.featuredGame.flipBoard} />
      </div>
    </section>
  );
}
