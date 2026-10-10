"use client";

import type { FormEvent } from "react";
import { Keepsake } from "@/components/adventure/keepsakes/keepsake/keepsake.comp";
import { StampArt } from "@/components/adventure/stamp/encounter-stamp/stamp-art.comp";
import { ArrowRightIcon } from "@/components/icons/arrow-right-icon.comp";
import { ChessKingPieceIcon } from "@/components/icons/chess-king-piece-icon.comp";
import { ChessPawnPieceIcon } from "@/components/icons/chess-pawn-piece-icon.comp";
import { ChessRookPieceIcon } from "@/components/icons/chess-rook-piece-icon.comp";
import { DiceIcon } from "@/components/icons/dice-icon.comp";
import { LockIcon } from "@/components/icons/lock-icon.comp";
import { StarIcon } from "@/components/icons/star-icon.comp";
import { PlatformChoiceCards } from "@/components/platform/shared/platform-choice-cards/platform-choice-cards.comp";
import { PlatformForm, PlatformFormGroup } from "@/components/platform/shared/platform-form/platform-form.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button/submit-button.comp";
import { postmarkDate, postmarkText } from "@/lib/adventure/postmark";
import { starsForAttempts } from "@/services/adventure/adventure-rules";
import type { EncounterView } from "@/services/adventure/adventure.types";
import type { OpenGameSummary } from "@/services/play/play.types";
import "@/components/adventure/adventure.css";
import "./rival-card.comp.css";

interface RivalCardProps {
  /** The adventure's slug: the form sends it, and the portrait and the keepsake are looked up by it. */
  adventure: string;
  encounter: EncounterView;
  /** The place written round the postmark of the rival's zone. */
  postmark: string;
  /** The rival before this one in the story, for «Supera a … para llegar aquí»; null for the first. */
  previousName: string | null;
  /** The person's name, which the membership card writes. */
  playerName: string;
  /** The person's open game against a bot: starting this encounter closes it, so the card warns and asks first. */
  openGame: OpenGameSummary | null;
  /** `startAdventureEncounter`, or a stub in Storybook. */
  action: (formData: FormData) => void | Promise<void>;
  /** With an open game: the person pressed the button, and the host asks for confirmation with the form's data. */
  onReplace: (formData: FormData) => void;
  onCancel: () => void;
}

/** «Al primer intento», «En 2 intentos». */
const triesText = (attempts: number) => (attempts === 1 ? "Al primer intento" : `En ${attempts} intentos`);

/** Three stars: filled ones are earned (or earnable), the rest are outlines. */
function Stars({ filled, isPromise }: { filled: number; isPromise: boolean }) {
  return (
    <span className="rival-card__stars" aria-hidden="true">
      {[1, 2, 3].map((star) => (
        <StarIcon
          key={star}
          variant={star <= filled && !isPromise ? "classic-solid" : "classic-light"}
          className={`rival-card__star${star <= filled ? " rival-card__star_on" : ""}${isPromise ? " rival-card__star_promise" : ""}`}
        />
      ))}
    </span>
  );
}

/**
 * A rival's card, as the content of a `PlatformPopup` (whose strip says «Ficha de rival · N.º 05 de 12»): the stamp large on four
 * corners of tape, the name and the role; where the person stands with the rival
 * (beaten with its postmark and the length of the game, available with its
 * attempt, locked with who to beat first); the rival's phrase; and the facts
 * of a passport page — the level, the difficulty, the favourite opening, the
 * style, where it is played, the stars it gives and the keepsake it leaves. Under
 * them, the colour to play with and the button: «Empezar» for the available
 * one, «Volver a retar» for a beaten one (it touches neither stars nor
 * keepsake), and none for a locked one. With another game open, the button asks
 * the host to confirm before closing it.
 */
export function RivalCard({
  adventure,
  encounter,
  postmark,
  previousName,
  playerName,
  openGame,
  action,
  onReplace,
  onCancel,
}: RivalCardProps) {
  const { state, attempts, stars } = encounter;
  const isLocked = state === "locked";
  const nextAttempt = attempts + 1;
  const earnable = starsForAttempts(state === "beaten" ? attempts : nextAttempt);
  const moves = encounter.winPlies === null ? null : Math.ceil(encounter.winPlies / 2);
  const buttonLabel = state === "beaten" ? "Volver a retar" : "Empezar";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    if (!openGame) return;
    event.preventDefault();
    onReplace(new FormData(event.currentTarget));
  };

  return (
    <div className={`adventure rival-card rival-card_status_${state}`}>
      <div className="rival-card__intro">
        <div className="rival-card__portrait" aria-hidden="true">
          <StampArt adventure={adventure} encounter={encounter} postmark={postmark} isProof={isLocked} />
          <i />
          <i />
          <i />
          <i />
          {isLocked && (
            <svg className="rival-card__padlock" viewBox="0 0 60 66" focusable="false">
              <g fill="none" stroke="#a83a2a" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 30V20C17 11 23 6 30 6C37.5 6 43 11 43 20V30" strokeWidth="4.5" />
                <path d="M8 29.5H52.5L51.4 61H9Z" strokeWidth="4" fill="rgba(251,246,234,.92)" />
                <path d="M30 41V50" strokeWidth="4.5" />
                <circle cx="30" cy="40" r="3.6" strokeWidth="3" />
              </g>
            </svg>
          )}
        </div>
        <div className="rival-card__who">
          <h3 className="rival-card__name">{encounter.name}</h3>
          <p className="rival-card__role">{encounter.role}</p>
        </div>
      </div>

      <div className="rival-card__status">
        {state === "beaten" && (
          <>
            <svg className="rival-card__seal" viewBox="0 0 56 56" aria-hidden="true" focusable="false">
              <g fill="none" stroke="#26344f" opacity=".8">
                <circle cx="28" cy="28" r="24" strokeWidth="2" />
                <circle cx="28" cy="28" r="16" strokeWidth="1" />
              </g>
              {encounter.beatenAt && (
                <>
                  <text x="28" y="27" textAnchor="middle" fontSize="9" fontWeight="600" fill="#26344f">
                    {`${postmarkDate(encounter.beatenAt).day} ${postmarkDate(encounter.beatenAt).month}`}
                  </text>
                  <text x="28" y="37" textAnchor="middle" fontSize="7" fill="#26344f">
                    {postmarkDate(encounter.beatenAt).year}
                  </text>
                </>
              )}
            </svg>
            <p>
              <b>Superado</b>
              {encounter.beatenAt && <span className="rival-card__date"> · {postmarkText(encounter.beatenAt)}</span>}
              {moves !== null && <span className="rival-card__line">Ganaste en {moves} jugadas</span>}
            </p>
          </>
        )}
        {state === "available" && (
          <>
            <span className="rival-card__dot" aria-hidden="true" />
            <p>
              <b>Disponible</b>
              {attempts > 0 && <span className="rival-card__date"> · Intento {nextAttempt}</span>}
              <span className="rival-card__line">
                {attempts === 0
                  ? "Es tu próximo rival."
                  : `Ya lo intentaste ${attempts === 1 ? "una vez" : `${attempts} veces`}: la historia te espera en esta página.`}
              </span>
            </p>
          </>
        )}
        {isLocked && (
          <>
            <LockIcon variant="classic-solid" className="rival-card__lock" />
            <p>
              <b>Bloqueado</b>
              <span className="rival-card__line">
                {previousName ? `Supera a ${previousName} para llegar aquí.` : "Todavía no puedes llegar aquí."}
              </span>
            </p>
          </>
        )}
      </div>

      <p className="rival-card__phrase">«{encounter.phrase}»</p>

      <dl className="rival-card__facts">
        <div className="rival-card__fact rival-card__fact_half">
          <dt>Nivel orientativo</dt>
          <dd>
            <span className="rival-card__level">≈ {encounter.elo}</span>
          </dd>
        </div>
        <div className="rival-card__fact rival-card__fact_half">
          <dt>Dificultad</dt>
          <dd>
            {encounter.difficultyLabel}
            <span className="rival-card__pawns" role="img" aria-label={`Dificultad ${encounter.difficulty} de 5`}>
              {[1, 2, 3, 4, 5].map((pawn) => (
                <ChessPawnPieceIcon
                  key={pawn}
                  variant={pawn <= encounter.difficulty ? "duotone-solid" : "classic-light"}
                  className={`rival-card__pawn${pawn <= encounter.difficulty ? " rival-card__pawn_on" : ""}`}
                />
              ))}
            </span>
          </dd>
        </div>
        <div className="rival-card__fact">
          <dt>Apertura favorita</dt>
          <dd>
            {encounter.opening.name}
            <span className="rival-card__moves">{encounter.opening.moves}</span>
          </dd>
        </div>
        <div className="rival-card__fact rival-card__fact_half">
          <dt>Estilo</dt>
          <dd>
            <span className="rival-card__styles">
              {encounter.style.map((style) => (
                <span key={style} className="rival-card__style">
                  {style}
                </span>
              ))}
            </span>
          </dd>
        </div>
        <div className="rival-card__fact rival-card__fact_half">
          <dt>Dónde se juega</dt>
          <dd>
            {encounter.place}
            <span className="rival-card__moves">{encounter.zoneName}</span>
          </dd>
        </div>
        <div className="rival-card__fact">
          <dt>Estrellas</dt>
          <dd className="rival-card__reward">
            {state === "beaten" ? (
              <>
                <Stars filled={stars} isPromise={false} />
                <span>{triesText(attempts)}</span>
              </>
            ) : (
              <>
                <Stars filled={earnable} isPromise />
                <span>
                  si ganas{" "}
                  {state === "available" && attempts > 0 ? `en el intento ${nextAttempt}` : "al primer intento"}
                </span>
              </>
            )}
          </dd>
        </div>
        <div className="rival-card__fact">
          <dt>Recuerdo</dt>
          <dd className="rival-card__keepsake">
            <span className="rival-card__keepsake-drawing">
              <Keepsake
                adventure={adventure}
                order={encounter.order}
                playerName={playerName}
                isSealed={state !== "beaten"}
              />
            </span>
            <span>{state === "beaten" ? encounter.keepsake : "Al ganarle: un recuerdo para tu cuaderno"}</span>
          </dd>
        </div>
      </dl>

      {!isLocked && (
        <PlatformForm action={action} onSubmit={submit} className="rival-card__form">
          <input type="hidden" name="adventure" value={adventure} />
          <input type="hidden" name="encounter" value={encounter.order} />

          <PlatformFormGroup label="Juegas con">
            <PlatformChoiceCards
              name="color"
              defaultValue="white"
              required
              options={[
                {
                  value: "white",
                  label: "Blancas",
                  icon: <ChessKingPieceIcon variant="duotone-light" className="rival-card__piece" />,
                },
                {
                  value: "black",
                  label: "Negras",
                  icon: <ChessKingPieceIcon variant="duotone-solid" className="rival-card__piece" />,
                },
                { value: "random", label: "Al azar", icon: <DiceIcon className="rival-card__piece" /> },
              ]}
            />
          </PlatformFormGroup>

          {openGame && (
            <p className="rival-card__warning">
              Empezar otra cierra la que tienes en curso contra {openGame.rival.name}: si ya hiciste dos jugadas, la
              pierdes por abandono.
            </p>
          )}

          <footer className="rival-card__foot">
            <button type="button" className="platform-button" onClick={onCancel}>
              Cancelar
            </button>
            {openGame ? (
              <button type="submit" className="platform-button platform-button_variant_ink">
                {buttonLabel}
                <ArrowRightIcon variant="classic-solid" className="platform-button__icon" />
              </button>
            ) : (
              <SubmitButton className="platform-button platform-button_variant_ink" pendingLabel="Preparando…">
                {buttonLabel}
                <ArrowRightIcon variant="classic-solid" className="platform-button__icon" />
              </SubmitButton>
            )}
          </footer>
        </PlatformForm>
      )}

      <ChessRookPieceIcon variant="duotone-light" className="rival-card__watermark" />
    </div>
  );
}
