import { FormField } from "@/components/common/form-field.comp";
import type { StudyKindOption } from "@/services/studies/studies.types";
import "./game-fields.comp.css";

// Los datos de una partida, en un solo sitio.
//
// Los usan los dos formularios —crear y editar— y tienen que ofrecer
// exactamente los mismos campos: si al crear se pudiera rellenar algo que
// después no se puede corregir, el dato quedaría atrapado.
//
// TODOS son opcionales, también al crear: cuando se empieza a analizar todavía
// no se sabe qué partida va a ser.

export interface GameFieldValues {
  title?: string;
  white?: string;
  black?: string;
  whiteElo?: number;
  blackElo?: number;
  resultCode?: string;
  /** ISO corto (aaaa-mm-dd), que es lo que espera <input type="date">. */
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

interface GameFieldsProps {
  values?: GameFieldValues;
  results: StudyKindOption[];
  /** Texto de ayuda del nombre, distinto al crear que al editar. */
  titleHint: string;
}

export function GameFields({ values, results, titleHint }: GameFieldsProps) {
  return (
    <div className="game-fields">
      <FormField label="Nombre de la partida" hint={titleHint}>
        <input type="text" name="title" defaultValue={values?.title ?? ""} maxLength={120} />
      </FormField>

      <div className="game-fields__row">
        <FormField label="Blancas">
          <input type="text" name="white" defaultValue={values?.white ?? ""} maxLength={120} />
        </FormField>
        <FormField label="Elo de las blancas">
          <input type="number" name="whiteElo" defaultValue={values?.whiteElo ?? ""} min={100} max={4000} />
        </FormField>
      </div>

      <div className="game-fields__row">
        <FormField label="Título de las blancas" hint="GM, IM, WGM…">
          <input type="text" name="whiteTitle" defaultValue={values?.whiteTitle ?? ""} maxLength={8} />
        </FormField>
        <FormField label="Federación de las blancas" hint="Código de tres letras, como «MEX».">
          <input type="text" name="whiteCountry" defaultValue={values?.whiteCountry ?? ""} maxLength={3} />
        </FormField>
      </div>

      <div className="game-fields__row">
        <FormField label="Negras">
          <input type="text" name="black" defaultValue={values?.black ?? ""} maxLength={120} />
        </FormField>
        <FormField label="Elo de las negras">
          <input type="number" name="blackElo" defaultValue={values?.blackElo ?? ""} min={100} max={4000} />
        </FormField>
      </div>

      <div className="game-fields__row">
        <FormField label="Título de las negras" hint="GM, IM, WGM…">
          <input type="text" name="blackTitle" defaultValue={values?.blackTitle ?? ""} maxLength={8} />
        </FormField>
        <FormField label="Federación de las negras" hint="Código de tres letras, como «USA».">
          <input type="text" name="blackCountry" defaultValue={values?.blackCountry ?? ""} maxLength={3} />
        </FormField>
      </div>

      <div className="game-fields__row">
        <FormField label="Resultado">
          <select name="resultCode" defaultValue={values?.resultCode ?? "ONGOING"}>
            {results.map((result) => (
              <option key={result.code} value={result.code}>
                {result.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Fecha">
          <input type="date" name="playedAt" defaultValue={values?.playedAtValue ?? ""} />
        </FormField>
      </div>

      <div className="game-fields__row">
        <FormField label="Evento">
          <input type="text" name="event" defaultValue={values?.event ?? ""} maxLength={120} />
        </FormField>
        <FormField label="Lugar">
          <input type="text" name="site" defaultValue={values?.site ?? ""} maxLength={120} />
        </FormField>
      </div>

      <div className="game-fields__row">
        <FormField label="Ronda">
          <input type="text" name="round" defaultValue={values?.round ?? ""} maxLength={120} />
        </FormField>
        <FormField label="ECO" hint="Código de apertura, como «B40».">
          <input type="text" name="eco" defaultValue={values?.eco ?? ""} maxLength={120} />
        </FormField>
      </div>
    </div>
  );
}
