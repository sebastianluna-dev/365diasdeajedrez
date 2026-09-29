import { SearchIcon } from "@/components/icons/search-icon.comp";
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
 */
export function PlatformSearch() {
  return (
    <div className="platform-search" role="search">
      <label className="platform-search__label" htmlFor="platform-search-field">
        Buscar en la plataforma
      </label>

      <SearchIcon className="platform-search__icon" />

      <input
        id="platform-search-field"
        className="platform-search__field"
        type="search"
        name="q"
        placeholder="Buscar"
        autoComplete="off"
      />
    </div>
  );
}
