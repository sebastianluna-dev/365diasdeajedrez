"use client";

import { ChessKingPieceIcon } from "@/components/icons/chess-king-piece-icon.comp";
import { DiceIcon } from "@/components/icons/dice-icon.comp";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import { PlatformForm, PlatformFormGroup } from "@/components/platform/shared/platform-form/platform-form.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import type { BotView } from "@/services/bots/bots.types";
import type { OpenGameSummary } from "@/services/play/play.types";
import "./start-game-form.comp.css";

interface StartGameFormProps {
  bot: BotView;
  /** The open game against a bot, which starting this one closes. */
  openGame: OpenGameSummary | null;
  /** `startPlayedGame`, or a stub in Storybook. */
  action: (formData: FormData) => void | Promise<void>;
  onCancel: () => void;
}

/**
 * The colour and «Jugar», under a bot's sheet. With a game already open
 * against a bot it says so before: starting this one closes that one — lost
 * by abandonment after two moves of one's own, cancelled before them.
 */
export function StartGameForm({ bot, openGame, action, onCancel }: StartGameFormProps) {
  return (
    <PlatformForm action={action} className="start-game">
      <input type="hidden" name="bot" value={bot.slug} />
      {openGame && <input type="hidden" name="replace" value="1" />}

      <PlatformFormGroup label="Juegas con">
        <PlatformChoiceCards
          name="color"
          defaultValue="white"
          required
          options={[
            {
              value: "white",
              label: "Blancas",
              icon: <ChessKingPieceIcon variant="duotone-light" className="start-game__piece" />,
            },
            {
              value: "black",
              label: "Negras",
              icon: <ChessKingPieceIcon variant="duotone-solid" className="start-game__piece" />,
            },
            { value: "random", label: "Al azar", icon: <DiceIcon className="start-game__piece" /> },
          ]}
        />
      </PlatformFormGroup>

      {openGame && (
        <p className="start-game__warning">
          Empezar otra cierra la que tienes en curso contra {openGame.rival.name}: si ya hiciste dos jugadas, la pierdes
          por abandono.
        </p>
      )}

      <footer className="start-game__foot">
        <button type="button" className="platform-button" onClick={onCancel}>
          Cancelar
        </button>
        <SubmitButton className="platform-button platform-button_variant_ink" pendingLabel="Preparando…">
          Jugar
        </SubmitButton>
      </footer>
    </PlatformForm>
  );
}
