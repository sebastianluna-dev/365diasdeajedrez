import { ArrowsRotateIcon } from "@/components/icons/arrows-rotate-icon.comp";
import "./live-game-banner.comp.css";

const MESSAGES = {
  stale: "Esta partida cambió en otra pestaña.",
  "engine-failed": "El módulo dejó de responder. Lo que jugaste está guardado.",
} as const;

interface LiveGameBannerProps {
  kind: keyof typeof MESSAGES;
  onReload: () => void;
}

/**
 * Why the board stopped, over it and never covering it: another tab moved,
 * or the bot's engine died. Either way nothing is lost — every move is saved
 * before the bot is asked — and «Recargar» starts again from what the server
 * has.
 */
export function LiveGameBanner({ kind, onReload }: LiveGameBannerProps) {
  return (
    <div className="live-game-banner" role="alert">
      <span className="live-game-banner__text">{MESSAGES[kind]}</span>
      <button type="button" className="platform-button platform-button_size_sm" onClick={onReload}>
        <ArrowsRotateIcon variant="classic-solid" className="platform-button__icon" />
        Recargar
      </button>
    </div>
  );
}
