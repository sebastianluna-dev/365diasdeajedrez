"use client";

import { useId } from "react";
import { MagnifyingGlassIcon } from "@/components/icons/magnifying-glass-icon.comp";
import "./platform-search-field.comp.css";

interface PlatformSearchFieldProps {
  /** The field's accessible name: «Buscar clase», «Buscar alumno». */
  label: string;
  placeholder: string;
  defaultValue?: string;
  /**
   * The parameter it sends with the form it sits in («q»). Without a name it
   * travels nowhere, and Enter does not submit the form around it: a filter
   * that only narrows what is on screen.
   */
  name?: string;
  onValueChange?: (value: string) => void;
}

/**
 * A search box: the magnifying glass and a `type="search"` input in one
 * frame. A search is not a form — it validates nothing and never errs — so
 * its focus is the accent's, like every filter. With a `name` it is a field
 * of the form around it and Enter submits; without one it only narrows what
 * is on screen through `onValueChange`, and Enter is swallowed.
 */
export function PlatformSearchField({
  label,
  placeholder,
  defaultValue,
  name,
  onValueChange,
}: PlatformSearchFieldProps) {
  const id = useId();
  return (
    <div className="platform-search-field">
      <label htmlFor={id} className="platform-search-field__label">
        {label}
      </label>
      <MagnifyingGlassIcon variant="classic-solid" className="platform-search-field__icon" />
      <input
        id={id}
        type="search"
        name={name}
        className="platform-search-field__input"
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete="off"
        onChange={(event) => onValueChange?.(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (!name && event.key === "Enter") event.preventDefault();
        }}
      />
    </div>
  );
}
