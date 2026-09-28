import { PlatformNotice } from "@/components/platform/shared/platform-notice.comp";
import { STAFF_ERROR_MESSAGES } from "@/constants/platform/staff-messages.const";
import type { CatalogOption, ChapterGameDetail } from "@/services/staff-courses/staff-courses.types";
import { ChapterGameAside } from "./chapter-game-aside.comp";
import { ChapterGameBoard } from "./chapter-game-board.comp";
import "./chapter-game.section.css";

interface ChapterGameSectionProps {
  game: ChapterGameDetail;
  /** Results from the catalog, for the record's form. */
  results: CatalogOption[];
  /** What bounced back from saving the record. */
  errorCode?: string;
}

/**
 * A game of a chapter's collection, on the board: where the staff reads it
 * and edits it, the way a student does with a game of their own studies.
 *
 * Two columns: the collection and the game's record on the left, the board
 * on the right. It is a workspace and not a page that opens with a big
 * title: the board gets the height. The section lays out and hands over;
 * the only piece with state is the board (`ChapterGameBoard`).
 */
export function ChapterGameSection({ game, results, errorCode }: ChapterGameSectionProps) {
  const errorMessage = errorCode ? (STAFF_ERROR_MESSAGES[errorCode] ?? STAFF_ERROR_MESSAGES.invalid) : undefined;

  return (
    <div className="chapter-game">
      {errorMessage && <PlatformNotice message={errorMessage} />}

      <div className="chapter-game__layout">
        <ChapterGameAside game={game} results={results} />
        {/* Keyed by the game: jumping to another one from the list remounts
            the board, so its history and its autosave start clean instead of
            carrying the previous game's PGN over. */}
        <ChapterGameBoard key={game.id} game={game} />
      </div>
    </div>
  );
}
