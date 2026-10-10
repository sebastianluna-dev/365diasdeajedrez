"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { PlayerAvatar } from "@/components/chess/player-avatar/player-avatar.comp";
import { PlayIcon } from "@/components/icons/play-icon.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { eloSpanOf, type SuggestedBot } from "@/services/bots/bot-rules";
import type { BotGroupView, BotView } from "@/services/bots/bots.types";
import type { BotScore, OpenGameSummary } from "@/services/play/play.types";
import type { PlayerCard } from "@/services/profile/profile.types";
import { BotCard } from "./bot-card/bot-card.comp";
import { BotSheet } from "./bot-sheet/bot-sheet.comp";
import { StartGameForm } from "./start-game-form.comp";

interface BotGalleryProps {
  groups: BotGroupView[];
  scores: BotScore[];
  suggestion: SuggestedBot | null;
  you: PlayerCard;
  openGame: OpenGameSummary | null;
  /** `?rival=<slug>`: the bot whose popup opens on arrival. */
  initialRival: string | null;
  /** `startPlayedGame`. */
  action: (formData: FormData) => void | Promise<void>;
}

/**
 * The lobby's leaf with state (J1): the suggested rival, a row per group, and
 * the popup a card opens — the bot's sheet, the colour and «Jugar». The sheet
 * changes with the bot, so it is drawn before the popup opens: the popup then
 * focuses the content it finds, the colour cards.
 */
export function BotGallery({ groups, scores, suggestion, you, openGame, initialRival, action }: BotGalleryProps) {
  const popup = useRef<PlatformPopupHandle>(null);
  const bots = groups.flatMap((group) => group.bots);
  const [picked, setPicked] = useState<BotView | null>(() => bots.find((bot) => bot.slug === initialRival) ?? null);
  const scoreOf = (bot: BotView) => scores.find((score) => score.botId === bot.id) ?? null;

  const pick = (bot: BotView, event: MouseEvent<HTMLButtonElement>) => {
    flushSync(() => setPicked(bot));
    popup.current?.open(event);
  };

  // A link to `/jugar/partida-libre?rival=<slug>` (a profile's «Jugar de nuevo») opens that bot's popup once.
  const openedOnArrival = useRef(false);
  useEffect(() => {
    if (openedOnArrival.current || !picked || picked.slug !== initialRival) return;
    openedOnArrival.current = true;
    popup.current?.open();
  }, [picked, initialRival]);

  return (
    <>
      {suggestion && (
        <section className="play-lobby__suggested" aria-labelledby="play-lobby-suggested">
          <PlayerAvatar {...suggestion.bot.avatar} size="lg" />
          <div className="play-lobby__suggested-text">
            <span id="play-lobby-suggested" className="play-lobby__eyebrow">
              {suggestion.after
                ? `Tu rival sugerido · después de ${suggestion.after.name}`
                : "Tu rival sugerido · para empezar"}
            </span>
            <span className="play-lobby__suggested-name">
              {suggestion.bot.name} <span className="play-lobby__suggested-elo">≈ {suggestion.bot.elo}</span>
            </span>
            <span className="play-lobby__suggested-bio">{suggestion.bot.bio}</span>
          </div>
          <button
            type="button"
            className="platform-button platform-button_variant_accent platform-button_size_lg"
            onClick={(event) => pick(suggestion.bot, event)}
          >
            <PlayIcon variant="classic-solid" className="platform-button__icon" />
            Jugar contra {suggestion.bot.name}
          </button>
        </section>
      )}

      {groups.map((group) => (
        <section key={group.code} className="play-lobby__group" aria-labelledby={`play-lobby-${group.code}`}>
          <header className="play-lobby__group-head">
            <h2 id={`play-lobby-${group.code}`} className="play-lobby__group-title">
              {group.label}
            </h2>
            <span className="play-lobby__group-span">{eloSpanOf(group)}</span>
          </header>
          <ul className="play-lobby__row">
            {group.bots.map((bot) => (
              <li key={bot.id} className="play-lobby__cell">
                <BotCard bot={bot} score={scoreOf(bot)} onPick={(event) => pick(bot, event)} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <PlatformPopup
        ref={popup}
        title={picked ? `${picked.fideTitle ? `${picked.fideTitle} ` : ""}${picked.name}` : "Elige un rival"}
        size="sm"
      >
        {picked && (
          <div className="play-lobby__popup">
            <BotSheet bot={picked} you={you} score={scoreOf(picked)} />
            <StartGameForm bot={picked} openGame={openGame} action={action} onCancel={() => popup.current?.close()} />
          </div>
        )}
      </PlatformPopup>
    </>
  );
}
