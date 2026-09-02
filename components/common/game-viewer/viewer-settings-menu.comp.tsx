"use client";

import { useEffect, useRef } from "react";
import type { ViewerPreferences } from "./viewer-preferences";

interface ViewerSettingsMenuProps {
  preferences: ViewerPreferences;
  onChange: (preferences: ViewerPreferences) => void;
  onClose: () => void;
}

const OPTIONS: { key: keyof ViewerPreferences; label: string; hint: string }[] = [
  { key: "coordinates", label: "Coordenadas", hint: "Letras y números en el borde" },
  { key: "animation", label: "Animación", hint: "La pieza se desliza al cambiar de jugada" },
  { key: "sound", label: "Sonido", hint: "Un golpe corto en cada jugada" },
];

export function ViewerSettingsMenu({ preferences, onChange, onClose }: ViewerSettingsMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // Se cierra al pulsar fuera o con Escape, como cualquier menú suelto.
  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onClose();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="viewer-settings-menu" ref={rootRef} role="group" aria-label="Ajustes del tablero">
      {OPTIONS.map((option) => (
        <label key={option.key} className="viewer-settings-menu__option">
          <input
            type="checkbox"
            className="viewer-settings-menu__input"
            checked={preferences[option.key]}
            onChange={(event) => onChange({ ...preferences, [option.key]: event.target.checked })}
          />
          <span className="viewer-settings-menu__text">
            <span className="viewer-settings-menu__label">{option.label}</span>
            <span className="viewer-settings-menu__hint">{option.hint}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
