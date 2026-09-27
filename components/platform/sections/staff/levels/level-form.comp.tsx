"use client";

import { useRef, useState } from "react";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { SubmitButton } from "@/components/platform/shared/submit-button.comp";
import { ELO_MAX } from "@/constants/platform/course-levels.const";
import { generateSlug } from "@/lib/generate-slug";
import { createLevel, updateLevel } from "@/services/staff-levels/staff-levels.actions";
import type { LevelAdminRow } from "@/services/staff-levels/staff-levels.types";
import "./level-form.comp.css";

/** What the actions accept as a slug: lowercase words joined by single hyphens. */
const SLUG_PATTERN = "[a-z0-9]+(-[a-z0-9]+)*";

const ELO_MESSAGES = {
  badInput: "Escribe un número entero.",
  stepMismatch: "Escribe un número entero.",
  rangeOverflow: `Como mucho ${ELO_MAX}.`,
};

interface LevelFormProps {
  /** The level being edited; absent, the form creates a new one. */
  level?: LevelAdminRow;
}

/**
 * The form of one level, for creating it or for editing it: name, slug,
 * description, position and the orientative Elo range, both ends inclusive.
 * An empty maximum is an open range ("2200 o más"), never a zero.
 *
 * The fields are uncontrolled, so the form empties by itself once the action
 * is done. The only state is the floor of the maximum, which follows the
 * minimum so the browser refuses a range that is upside down; the server
 * checks the same.
 *
 * On a new level the slug writes itself from the name when the name loses
 * focus, as long as the slug is still the form's and not the user's.
 */
export function LevelForm({ level }: LevelFormProps) {
  const isNew = level === undefined;
  const slugRef = useRef<HTMLInputElement>(null);
  const isSlugOwn = useRef(false);
  const [eloFloor, setEloFloor] = useState(level?.eloMin ?? 0);

  const suggestSlug = (name: string) => {
    if (!isNew || isSlugOwn.current || !slugRef.current) return;
    slugRef.current.value = generateSlug(name);
  };

  return (
    <PlatformForm
      className="level-form"
      action={isNew ? createLevel : updateLevel.bind(null, level.id)}
      autoComplete="off"
      onReset={() => {
        isSlugOwn.current = false;
        setEloFloor(level?.eloMin ?? 0);
      }}
    >
      <div className="level-form__row level-form__row_columns_two">
        <PlatformFormField name="name" label="Nombre" messages={{ valueMissing: "Ponle un nombre al nivel." }}>
          <input
            type="text"
            maxLength={80}
            required
            defaultValue={level?.name}
            placeholder={isNew ? "Intermedio" : undefined}
            onBlur={(event) => suggestSlug(event.target.value)}
          />
        </PlatformFormField>

        <PlatformFormField
          name="slug"
          label="Identificador (slug)"
          hint={
            isNew
              ? "Se escribe solo a partir del nombre; puedes cambiarlo. Aparece en la URL del filtro de cursos."
              : "Minúsculas, números y guiones. Aparece en la URL del filtro de cursos."
          }
          messages={{
            valueMissing: "El nivel necesita un identificador.",
            patternMismatch: "Sólo minúsculas, números y guiones, sin espacios.",
          }}
        >
          <input
            ref={slugRef}
            type="text"
            maxLength={80}
            pattern={SLUG_PATTERN}
            required
            defaultValue={level?.slug}
            placeholder={isNew ? "intermedio" : undefined}
            onChange={(event) => {
              // Typed by hand it is theirs; emptied, it goes back to following the name.
              isSlugOwn.current = event.target.value !== "";
            }}
          />
        </PlatformFormField>
      </div>

      <div className="level-form__row level-form__row_columns_three">
        <PlatformFormField
          name="eloMin"
          label="Elo mínimo"
          hint="Incluido en el rango. 0 para el primer nivel."
          messages={{
            ...ELO_MESSAGES,
            valueMissing: "Indica desde qué Elo.",
            rangeUnderflow: "No puede ser negativo.",
          }}
        >
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={ELO_MAX}
            step={1}
            required
            defaultValue={level?.eloMin}
            onChange={(event) => {
              const value = event.target.valueAsNumber;
              setEloFloor(Number.isInteger(value) && value >= 0 ? Math.min(value, ELO_MAX) : 0);
            }}
          />
        </PlatformFormField>

        <PlatformFormField
          name="eloMax"
          label="Elo máximo"
          optionalLabel="Opcional"
          hint="Incluido en el rango. Vacío = sin límite superior."
          messages={{ ...ELO_MESSAGES, rangeUnderflow: "No puede ser menor que el mínimo." }}
        >
          <input type="number" inputMode="numeric" min={eloFloor} max={ELO_MAX} step={1} defaultValue={level?.eloMax} />
        </PlatformFormField>

        <PlatformFormField
          name="order"
          label="Orden"
          optionalLabel={isNew ? "Opcional" : undefined}
          hint={isNew ? "Posición por dificultad. Vacío = al final." : "Posición por dificultad: el 1 es el más fácil."}
          messages={{
            badInput: "Escribe un número entero.",
            stepMismatch: "Escribe un número entero.",
            rangeUnderflow: "No puede ser negativo.",
            rangeOverflow: "Como mucho 999.",
            valueMissing: "Indica la posición.",
          }}
        >
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            step={1}
            required={!isNew}
            defaultValue={level?.order}
          />
        </PlatformFormField>
      </div>

      <PlatformFormField
        name="description"
        label="Descripción"
        hint="Qué se trabaja en este nivel. Se lee en la ficha del curso."
        messages={{ valueMissing: "Describe qué se trabaja en este nivel." }}
      >
        <textarea maxLength={500} required defaultValue={level?.description} />
      </PlatformFormField>

      {!isNew && (
        <label className="level-form__check">
          <input type="checkbox" name="isActive" defaultChecked={level.isActive} />
          <span>
            En uso
            <span className="level-form__check-hint">
              Un nivel retirado deja de verse en la plataforma y en el filtro de cursos. Los cursos que lo tenían lo
              conservan, por si vuelve a usarse.
            </span>
          </span>
        </label>
      )}

      <div className="level-form__submit">
        {isNew ? (
          <SubmitButton pendingLabel="Creando…">Crear nivel</SubmitButton>
        ) : (
          <SubmitButton className="platform-button platform-button_variant_secondary">Guardar</SubmitButton>
        )}
      </div>
    </PlatformForm>
  );
}
