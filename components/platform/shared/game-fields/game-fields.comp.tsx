import type { ComponentProps } from "react";
import { PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import type { PlatformLook } from "@/components/platform/shared/platform-look";
import { federationOptions, FIDE_TITLE_LABELS, FIDE_TITLES } from "@/lib/chess/federations";
import "./game-fields.comp.css";
import { PlatformSelect } from "@/components/platform/shared/platform-select/platform-select.comp";
import { PlatformDatePicker } from "@/components/platform/shared/platform-date-picker/platform-date-picker.comp";
import { OptionalFields } from "@/components/platform/shared/optional-fields/optional-fields.comp";

// A game's data, in one place.
//
// Every form that writes a game's record uses them — the student's studies
// and the staff's chapter collections — and they all have to offer exactly the
// same fields: if something could be filled in on one that cannot be corrected
// on another, the data would be trapped.
//
// ALL are optional, also on creation: when analysis starts one does not yet
// know which game it is going to be. So they are said optional once, over
// them (`OptionalFields`), and no field carries its own «Opcional».
//
// They are `PlatformFormField`s, so they render inside a `PlatformForm` (the
// one of `EditGame`'s popup): a field needs the form's context.

export interface GameFieldValues {
  title?: string;
  white?: string;
  black?: string;
  whiteElo?: number;
  blackElo?: number;
  resultCode?: string;
  /** Short ISO (yyyy-mm-dd), which is what the date picker expects. */
  playedAtValue?: string;
  event?: string;
  site?: string;
  round?: string;
  eco?: string;
  whiteTitle?: string;
  blackTitle?: string;
  whiteCountry?: string;
  blackCountry?: string;
}

type CodeSelectProps = Omit<
  ComponentProps<typeof PlatformSelect>,
  "value" | "defaultValue" | "options" | "groups" | "emptyOption"
> & {
  /** The stored value, which may be one the lists do not have. */
  value: string | undefined;
  options: { code: string; label: string }[];
  emptyLabel: string;
};

/**
 * The dropdown of a value that comes from the PGN.
 *
 * A PGN may bring a title or a federation that is not in our lists — headers
 * are written by whoever wants — so the stored value is added as one more
 * option. Without that, opening the form and saving it without touching
 * anything would silently turn that value into a different one.
 *
 * The field hands its control `id`, `name`, the ref it validates through and
 * the ARIA that ties it to its messages: they pass on to the select.
 */
function CodeSelect({ value, options, emptyLabel, ...selectProps }: CodeSelectProps) {
  const current = value?.trim() ?? "";
  const isKnown = current.length === 0 || options.some((option) => option.code === current);

  return (
    <PlatformSelect
      {...selectProps}
      defaultValue={current}
      emptyOption={emptyLabel}
      options={[
        ...(isKnown ? [] : [{ value: current, label: `${current} (del PGN)` }]),
        ...options.map((option) => ({ value: option.code, label: option.label })),
      ]}
    />
  );
}

const TITLE_OPTIONS = FIDE_TITLES.map((code) => ({ code, label: `${code} · ${FIDE_TITLE_LABELS[code]}` }));

interface GameFieldsProps {
  values?: GameFieldValues;
  /** Results from the catalog; the label IS the PGN token ("1-0", "*"…). */
  results: { code: string; label: string }[];
  /** What the name's "i" says, different on creation and on edit. */
  titleHint: string;
  /**
   * `material`: the layout of «Formulario A» (2026-10-23), for the popup of a
   * page moved to the new design system — three sections titled in the
   * primary and divided by a rule («La partida», «Jugadores», «Resultado y
   * apertura»), two columns, and each player a row of name, Elo, title and
   * federation. Its host reads it from the popup (`usePlatformLook`): this
   * piece is also drawn by the server, which has no popup to ask.
   */
  look?: PlatformLook;
}

/** One player's four fields, labelled for the platform's layout (one under the other) or Material's (one row). */
function playerFields(side: "white" | "black", values: GameFieldValues | undefined, short: boolean) {
  const white = side === "white";
  const name = white ? "Blancas" : "Negras";
  const of = white ? "de las blancas" : "de las negras";
  return {
    name: (
      <PlatformFormField name={side} label={name}>
        <input type="text" defaultValue={(white ? values?.white : values?.black) ?? ""} maxLength={120} />
      </PlatformFormField>
    ),
    elo: (
      <PlatformFormField name={`${side}Elo`} label={short ? "Elo" : `Elo ${of}`}>
        <input type="number" defaultValue={(white ? values?.whiteElo : values?.blackElo) ?? ""} min={100} max={4000} />
      </PlatformFormField>
    ),
    title: (
      <PlatformFormField name={`${side}Title`} label={short ? "Título" : `Título ${of}`}>
        <CodeSelect
          value={white ? values?.whiteTitle : values?.blackTitle}
          options={TITLE_OPTIONS}
          emptyLabel="Sin título"
        />
      </PlatformFormField>
    ),
    country: (
      <PlatformFormField name={`${side}Country`} label={short ? "Federación" : `Federación ${of}`}>
        <CodeSelect
          value={white ? values?.whiteCountry : values?.blackCountry}
          options={federationOptions()}
          emptyLabel="Sin federación"
        />
      </PlatformFormField>
    ),
  };
}

export function GameFields({ values, results, titleHint, look = "platform" }: GameFieldsProps) {
  const material = look === "material";
  const white = playerFields("white", values, material);
  const black = playerFields("black", values, material);

  const title = (
    <PlatformFormField name="title" label={material ? "Nombre" : "Nombre de la partida"} info={titleHint}>
      <input type="text" defaultValue={values?.title ?? ""} maxLength={120} />
    </PlatformFormField>
  );
  const result = (
    <PlatformFormField name="resultCode" label="Resultado">
      <PlatformSelect
        defaultValue={values?.resultCode ?? "ONGOING"}
        options={results.map((option) => ({ value: option.code, label: option.label }))}
      />
    </PlatformFormField>
  );
  const date = (
    <PlatformFormField name="playedAt" label="Fecha">
      <PlatformDatePicker defaultValue={values?.playedAtValue ?? ""} />
    </PlatformFormField>
  );
  const event = (
    <PlatformFormField name="event" label="Evento">
      <input type="text" defaultValue={values?.event ?? ""} maxLength={120} />
    </PlatformFormField>
  );
  const site = (
    <PlatformFormField name="site" label="Lugar">
      <input type="text" defaultValue={values?.site ?? ""} maxLength={120} />
    </PlatformFormField>
  );
  const round = (
    <PlatformFormField name="round" label="Ronda">
      <input type="text" defaultValue={values?.round ?? ""} maxLength={120} />
    </PlatformFormField>
  );
  const eco = (
    <PlatformFormField name="eco" label="ECO" info="Código de apertura, como «B40».">
      <input type="text" defaultValue={values?.eco ?? ""} maxLength={120} />
    </PlatformFormField>
  );

  if (material) {
    return (
      <OptionalFields>
        <div className="game-fields game-fields_look_material">
          <div className="game-fields__section">
            <h3 className="game-fields__section-title">La partida</h3>
            <div className="game-fields__grid">
              {title}
              {event}
              {site}
              <div className="game-fields__grid">
                {date}
                {round}
              </div>
            </div>
          </div>

          {/* Each player a row, named by its side: «Elo» and «Título» are
              said once per row, and the group tells whose they are. */}
          <div className="game-fields__section">
            <h3 className="game-fields__section-title">Jugadores</h3>
            {[
              { side: "Blancas", fields: white },
              { side: "Negras", fields: black },
            ].map(({ side, fields }) => (
              <div key={side} role="group" aria-label={side} className="game-fields__player">
                {fields.name}
                {fields.elo}
                {fields.title}
                {fields.country}
              </div>
            ))}
          </div>

          <div className="game-fields__section">
            <h3 className="game-fields__section-title">Resultado y apertura</h3>
            <div className="game-fields__grid">
              {result}
              {eco}
            </div>
          </div>
        </div>
      </OptionalFields>
    );
  }

  return (
    <OptionalFields>
      <div className="game-fields">
        {title}

        <div className="game-fields__row">
          {white.name}
          {white.elo}
        </div>

        <div className="game-fields__row">
          {white.title}
          {white.country}
        </div>

        <div className="game-fields__row">
          {black.name}
          {black.elo}
        </div>

        <div className="game-fields__row">
          {black.title}
          {black.country}
        </div>

        <div className="game-fields__row">
          {result}
          {date}
        </div>

        <div className="game-fields__row">
          {event}
          {site}
        </div>

        <div className="game-fields__row">
          {round}
          {eco}
        </div>
      </div>
    </OptionalFields>
  );
}
