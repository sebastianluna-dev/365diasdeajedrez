import { getCurrentUser } from "@/lib/platform-auth/current-user";
import { suggestedBot } from "@/services/bots/bot-rules";
import { listBotGroups } from "@/services/bots/bots.service";
import { startPlayedGame } from "@/services/play/play.actions";
import { botScoreboardOf, getOpenPlayedGame } from "@/services/play/play.service";
import { getOwnPlayerCard } from "@/services/profile/profile.service";
import { BotGallery } from "./bot-gallery.comp";
import { OpenGameNotice } from "./open-game-notice/open-game-notice.comp";
import "./play-lobby.section.css";

/**
 * «Jugar» (J1): the open game first, if there is one; then the suggested
 * rival and every bot by group, each a card that opens its sheet and the
 * colour. Reads in one round; the leaf with state is the gallery.
 */
export async function PlayLobbySection({ rival }: { rival: string | null }) {
  const user = await getCurrentUser();
  const [groups, openGame, scores, you] = await Promise.all([
    listBotGroups(),
    getOpenPlayedGame(),
    botScoreboardOf(user.id),
    getOwnPlayerCard(),
  ]);

  return (
    <div className="play-lobby">
      {openGame && <OpenGameNotice game={openGame} />}
      <BotGallery
        groups={groups}
        scores={scores}
        suggestion={suggestedBot(groups, scores)}
        you={you}
        openGame={openGame}
        initialRival={rival}
        action={startPlayedGame}
      />
    </div>
  );
}
