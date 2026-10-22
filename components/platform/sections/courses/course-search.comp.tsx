"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { MagnifyingGlassIcon } from "@/components/icons/magnifying-glass-icon.comp";
import { platformRoutes } from "@/lib/platform-routes";
import "./course-search.comp.css";

/**
 * The catalog's search, in the bar as Material's search bar (2026-10-22): a
 * pill in the container's grey with the glass. It searches the WHOLE catalog
 * from any view, as Gmail searches every label: a GET form to
 * `/cursos/catalogo?q=`, so it works without JavaScript and the results have
 * an address. A search is not a form that validates — nothing to err —, so it
 * is a bare form and its focus is the primary's.
 *
 * Client, because it lives in the layout both pages share and still has to
 * show what was searched on the catalog's results: it reads `q` from the
 * address, and the field is remounted when it changes.
 */
export function CourseSearch() {
  const pathname = usePathname();
  const params = useSearchParams();
  const query = pathname === platformRoutes.courseCatalog ? (params.get("q") ?? "") : "";

  return (
    <form action={platformRoutes.courseCatalog} method="get" role="search" className="course-search">
      <MagnifyingGlassIcon variant="classic-solid" className="course-search__icon" />
      <input
        type="search"
        name="q"
        className="course-search__input"
        placeholder="Buscar cursos, temas o autores"
        aria-label="Buscar en el catálogo"
        key={query}
        defaultValue={query}
      />
    </form>
  );
}
