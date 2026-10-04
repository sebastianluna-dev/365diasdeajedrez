import { useId } from "react";
import { MagnifyingGlassIcon } from "@/components/icons/magnifying-glass-icon.comp";
import "./platform-search.comp.css";

/**
 * The bar's search field.
 *
 * It does not search yet: there is nothing to send it to — `/explorador`
 * looks up positions, not words — and a field that answered nothing would be
 * worse than one that plainly waits. So it is deliberately NOT a `<form>`:
 * with no form around it, pressing Enter does nothing at all, instead of
 * reloading the page with a query nobody reads.
 *
 * It is drawn at the size and in the place it will keep once it does search,
 * so that day changes what it does and not where things are.
 *
 * The id that ties the label to the field is generated: a page can hold two
 * of these (a Docs page with two stories), and a fixed one would point both
 * labels at the first field.
 */
export function PlatformSearch() {
  const fieldId = useId();

  return (
    <div className="platform-search" role="search">
      <label className="platform-search__label" htmlFor={fieldId}>
        Buscar en la plataforma
      </label>

      <MagnifyingGlassIcon className="platform-search__icon" />

      <input
        id={fieldId}
        className="platform-search__field"
        type="search"
        name="q"
        placeholder="Buscar"
        autoComplete="off"
      />
    </div>
  );
}
