"use client";

import { MagnifyingGlassIcon } from "@/components/icons/magnifying-glass-icon.comp";
import { platformRoutes } from "@/lib/platform-routes";
import "./studies-search.comp.css";

interface StudiesSearchProps {
  /**
   * What is searched, on «Mis estudios», where the library filters as one
   * types; with it the field is the page's (`onChange`). Without it, on a
   * study, the field is a plain GET form to `/estudios?q=`.
   */
  value?: string;
  onChange?: (value: string) => void;
}

/**
 * The studies' search, in the bar as Material's search bar (2026-10-23, as
 * «Cursos» draws its own): a pill in the container's grey with the glass.
 * On «Mis estudios» it filters the library as one types, with nothing sent;
 * on a study it takes the search to the library, which opens filtered. A
 * search is not a form that validates — nothing to err —, so it is a bare
 * form and its focus is the pill's own.
 */
export function StudiesSearch({ value, onChange }: StudiesSearchProps) {
  const isLive = onChange !== undefined;

  return (
    <form
      action={platformRoutes.studies}
      method="get"
      role="search"
      className="studies-search"
      // Live, everything is already on screen: Enter has nothing to send.
      onSubmit={isLive ? (event) => event.preventDefault() : undefined}
    >
      <MagnifyingGlassIcon variant="classic-solid" className="studies-search__icon" />
      <input
        type="search"
        name="q"
        className="studies-search__input"
        placeholder="Buscar por nombre o jugador"
        aria-label="Buscar estudios"
        {...(isLive ? { value: value ?? "", onChange: (event) => onChange(event.target.value) } : {})}
      />
    </form>
  );
}
