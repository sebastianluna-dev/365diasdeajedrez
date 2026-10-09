import type { ComponentProps } from "react";
import { PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
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
}

export function GameFields({ values, results, titleHint }: GameFieldsProps) {
  return (
    <OptionalFields>
      <div className="game-fields">
        <PlatformFormField name="title" label="Nombre de la partida" info={titleHint}>
          <input type="text" defaultValue={values?.title ?? ""} maxLength={120} />
        </PlatformFormField>

        <div className="game-fields__row">
          <PlatformFormField name="white" label="Blancas">
            <input type="text" defaultValue={values?.white ?? ""} maxLength={120} />
          </PlatformFormField>
          <PlatformFormField name="whiteElo" label="Elo de las blancas">
            <input type="number" defaultValue={values?.whiteElo ?? ""} min={100} max={4000} />
          </PlatformFormField>
        </div>

        <div className="game-fields__row">
          <PlatformFormField name="whiteTitle" label="Título de las blancas">
            <CodeSelect value={values?.whiteTitle} options={TITLE_OPTIONS} emptyLabel="Sin título" />
          </PlatformFormField>
          <PlatformFormField name="whiteCountry" label="Federación de las blancas">
            <CodeSelect value={values?.whiteCountry} options={federationOptions()} emptyLabel="Sin federación" />
          </PlatformFormField>
        </div>

        <div className="game-fields__row">
          <PlatformFormField name="black" label="Negras">
            <input type="text" defaultValue={values?.black ?? ""} maxLength={120} />
          </PlatformFormField>
          <PlatformFormField name="blackElo" label="Elo de las negras">
            <input type="number" defaultValue={values?.blackElo ?? ""} min={100} max={4000} />
          </PlatformFormField>
        </div>

        <div className="game-fields__row">
          <PlatformFormField name="blackTitle" label="Título de las negras">
            <CodeSelect value={values?.blackTitle} options={TITLE_OPTIONS} emptyLabel="Sin título" />
          </PlatformFormField>
          <PlatformFormField name="blackCountry" label="Federación de las negras">
            <CodeSelect value={values?.blackCountry} options={federationOptions()} emptyLabel="Sin federación" />
          </PlatformFormField>
        </div>

        <div className="game-fields__row">
          <PlatformFormField name="resultCode" label="Resultado">
            <PlatformSelect
              defaultValue={values?.resultCode ?? "ONGOING"}
              options={results.map((result) => ({ value: result.code, label: result.label }))}
            />
          </PlatformFormField>
          <PlatformFormField name="playedAt" label="Fecha">
            <PlatformDatePicker defaultValue={values?.playedAtValue ?? ""} />
          </PlatformFormField>
        </div>

        <div className="game-fields__row">
          <PlatformFormField name="event" label="Evento">
            <input type="text" defaultValue={values?.event ?? ""} maxLength={120} />
          </PlatformFormField>
          <PlatformFormField name="site" label="Lugar">
            <input type="text" defaultValue={values?.site ?? ""} maxLength={120} />
          </PlatformFormField>
        </div>

        <div className="game-fields__row">
          <PlatformFormField name="round" label="Ronda">
            <input type="text" defaultValue={values?.round ?? ""} maxLength={120} />
          </PlatformFormField>
          <PlatformFormField name="eco" label="ECO" info="Código de apertura, como «B40».">
            <input type="text" defaultValue={values?.eco ?? ""} maxLength={120} />
          </PlatformFormField>
        </div>
      </div>
    </OptionalFields>
  );
}
