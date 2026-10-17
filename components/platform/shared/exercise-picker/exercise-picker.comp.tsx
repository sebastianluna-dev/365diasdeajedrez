"use client";

import { useId, useState } from "react";
import { PlatformCheckCards } from "@/components/platform/shared/platform-check-cards/platform-check-cards.comp";
import { PlatformFormGroup } from "@/components/platform/shared/platform-form/platform-form.comp";
import { PlatformSearchField } from "@/components/platform/shared/platform-search-field/platform-search-field.comp";
import { foldForSearch } from "@/lib/fold-for-search";
import type { ExercisePickOption } from "./exercise-picker.types";
import "./exercise-picker.comp.css";

interface ExercisePickerProps {
  /** The name the chosen ids travel under, one hidden input each, in the order they were ticked. */
  name: string;
  /** What may be chosen: the author's usable exercises and the library's (D08), already filtered by the host. */
  exercises: ExercisePickOption[];
  /**
   * What the container already holds and the author could no longer pick —
   * archived, or taken out of the library —, still in `value`: drawn apart,
   * ticked and marked, to untick or to keep with its attempts. An unticked one
   * leaves the screen, since it cannot be picked again.
   */
  unavailable?: ExercisePickOption[];
  /** The chosen ids, in the order they were ticked: controlled by the host, which submits by hand. */
  value: string[];
  onValueChange: (ids: string[]) => void;
  /** The group's label: «Ejercicios». */
  label: string;
  /** What the server said of the group. */
  serverError?: string;
}

/** From how many exercises the search box is drawn: a handful are read at a glance. */
export const EXERCISE_PICKER_SEARCH_FROM = 6;

/**
 * Exercises to tick, for a series («Agregar ejercicios», PLAN.md §6.2) or a
 * class block («Ejercicio», D29): cards with each one's title, facts and
 * topics, a search over title and topics once there are a few, and the
 * chosen ids sent as hidden inputs in the order they were ticked — the cards'
 * DOM order is the list's, and a series or a block takes the tick order. A
 * draft or an archived exercise is never offered: the host's list is already
 * what the author may pick; one the container already holds and that can no
 * longer be picked (`unavailable`) is drawn apart, ticked, to untick or to
 * keep. Controlled: the host keeps the set and submits its form by hand, as
 * every form with Radix cards does.
 */
export function ExercisePicker({
  name,
  exercises,
  unavailable = [],
  value,
  onValueChange,
  label,
  serverError,
}: ExercisePickerProps) {
  const [search, setSearch] = useState("");
  const unavailableNoteId = useId();
  // Still ticked: an unticked one is gone for good, since it cannot be picked again.
  const kept = unavailable.filter((exercise) => value.includes(exercise.id));
  const query = foldForSearch(search.trim());
  const hidden = query
    ? exercises
        .filter((exercise) => !foldForSearch(`${exercise.title} ${exercise.topics}`).includes(query))
        .map((exercise) => exercise.id)
    : [];

  return (
    <div className="exercise-picker">
      {exercises.length >= EXERCISE_PICKER_SEARCH_FROM && (
        <PlatformSearchField
          label="Buscar ejercicio"
          placeholder="Buscar por título o tema"
          onValueChange={setSearch}
        />
      )}
      <PlatformFormGroup label={label} serverError={serverError}>
        <PlatformCheckCards
          value={value}
          onValueChange={onValueChange}
          hiddenValues={hidden}
          options={exercises.map((exercise) => ({
            value: exercise.id,
            label: exercise.title,
            meta: exercise.facts,
            description: exercise.topics || undefined,
          }))}
        />
      </PlatformFormGroup>
      {kept.length > 0 && (
        <div className="exercise-picker__unavailable">
          <p id={unavailableNoteId} className="exercise-picker__unavailable-note" role="alert">
            {kept.length === 1
              ? "1 ya no está disponible para tus alumnos: quítalo, o déjalo para conservar los intentos."
              : `${kept.length} ya no están disponibles para tus alumnos: quítalos, o déjalos para conservar los intentos.`}
          </p>
          <PlatformCheckCards
            aria-labelledby={unavailableNoteId}
            value={value}
            onValueChange={onValueChange}
            options={kept.map((exercise) => ({
              value: exercise.id,
              label: exercise.title,
              meta: exercise.facts,
              description: "Ya no está disponible",
            }))}
          />
        </div>
      )}
      {/* The cards carry no name: what the form sends is this, in the tick order. */}
      {value.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
      {query && hidden.length === exercises.length && (
        <p className="exercise-picker__empty">Ningún ejercicio coincide con la búsqueda.</p>
      )}
    </div>
  );
}
