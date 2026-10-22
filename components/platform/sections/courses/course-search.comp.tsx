import { MagnifyingGlassIcon } from "@/components/icons/magnifying-glass-icon.comp";
import { platformRoutes } from "@/lib/platform-routes";
import "./course-search.comp.css";

interface CourseSearchProps {
  defaultValue?: string;
}

/**
 * The catalog's search, in the bar as Material's search bar (2026-10-22): a
 * pill in the container's grey with the glass. It searches the WHOLE catalog
 * from any view, as Gmail searches every label: a GET form to
 * `/cursos/catalogo?q=`, so it works without JavaScript and the results have
 * an address. A search is not a form that validates — nothing to err —, so it
 * is a bare form and its focus is the primary's.
 */
export function CourseSearch({ defaultValue }: CourseSearchProps) {
  return (
    <form action={platformRoutes.courseCatalog} method="get" role="search" className="course-search">
      <MagnifyingGlassIcon variant="classic-solid" className="course-search__icon" />
      <input
        type="search"
        name="q"
        className="course-search__input"
        placeholder="Buscar cursos, temas o autores"
        aria-label="Buscar en el catálogo"
        defaultValue={defaultValue}
      />
    </form>
  );
}
