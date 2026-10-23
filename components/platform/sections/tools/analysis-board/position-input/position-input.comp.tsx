"use client";

import { useState, type FormEvent } from "react";
import { PlatformForm, PlatformFormField } from "@/components/platform/shared/platform-form/platform-form.comp";
import { FEN_MAX_LENGTH, readPositionInput } from "@/lib/chess/position-input";
import { PGN_MAX_LENGTH } from "@/constants/platform/content-limits.const";
import { mdButton } from "@/lib/material/material-classes";
import "./position-input.comp.css";

interface PositionInputProps {
  /** A PGN that opens: the board starts again from it. */
  onLoad: (pgn: string) => void;
}

/**
 * Where a position comes in (K1): two fields with their labels, «FEN» and
 * «PGN», and one «Cargar» that reads whichever has text — the PGN when both
 * do. It is checked here, before anything changes: a bad FEN or PGN says so
 * under its own field and the board stays as it was. Nothing travels to the
 * server. In the new design system (2026-10-23) it is the white box of the
 * side column's «Cargar», with Material's tonal button.
 */
export function PositionInput({ onLoad }: PositionInputProps) {
  const [error, setError] = useState<{ field: "fen" | "pgn"; message: string } | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const reading = readPositionInput({ fen: String(data.get("fen") ?? ""), pgn: String(data.get("pgn") ?? "") });
    if (!reading.ok) {
      setError({ field: reading.field ?? "fen", message: reading.message });
      return;
    }
    setError(null);
    event.currentTarget.reset();
    onLoad(reading.pgn);
  };

  return (
    <PlatformForm className="position-input" onSubmit={submit} onChange={() => setError(null)}>
      <PlatformFormField
        name="fen"
        label="FEN"
        hint="Una posición. Si escribes los dos, se carga el PGN."
        serverError={error?.field === "fen" ? error.message : undefined}
      >
        <input
          type="text"
          maxLength={FEN_MAX_LENGTH}
          spellCheck={false}
          autoComplete="off"
          placeholder="Pega una posición"
        />
      </PlatformFormField>
      <PlatformFormField name="pgn" label="PGN" serverError={error?.field === "pgn" ? error.message : undefined}>
        <textarea rows={2} maxLength={PGN_MAX_LENGTH} spellCheck={false} placeholder="Pega una partida" />
      </PlatformFormField>
      <button type="submit" className={`${mdButton("tonal", "sm")} position-input__submit`}>
        Cargar
      </button>
    </PlatformForm>
  );
}
