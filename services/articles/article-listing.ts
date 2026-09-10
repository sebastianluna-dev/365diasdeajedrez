import type { ArticleSummary } from "./articles.types";

// Filtro por categoría y paginación del blog. Es lógica pura y vive fuera del
// componente porque la usan la página (para leer los `searchParams`), la
// metadata (para la canónica) y las pruebas.
//
// Categoría y página van en la URL (`/blog?categoria=Táctica&pagina=2`) y no
// en estado de React: así cada página del blog se puede enlazar, compartir,
// rastrear y recuperar con «atrás». Los valores por defecto no se escriben.

export const ALL_CATEGORY = "Todos";
export const ARTICLES_PER_PAGE = 9;
export const CATEGORY_PARAM = "categoria";
export const PAGE_PARAM = "pagina";

export interface ArticleListingQuery {
  category: string;
  page: number;
}

type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Categorías con al menos un artículo, en orden de aparición, con «Todos» delante. */
export function categoriesOf(articles: ArticleSummary[]): string[] {
  const unique = new Set<string>();
  for (const article of articles) if (article.category) unique.add(article.category);
  return [ALL_CATEGORY, ...unique];
}

/** Lee la consulta de la URL; lo que no encaja vuelve al valor por defecto. */
export function parseListingQuery(params: SearchParams, categories: string[]): ArticleListingQuery {
  const rawCategory = single(params[CATEGORY_PARAM]);
  const category = rawCategory && categories.includes(rawCategory) ? rawCategory : ALL_CATEGORY;

  const rawPage = single(params[PAGE_PARAM]);
  const page = rawPage && /^\d+$/.test(rawPage) ? Math.max(1, Number.parseInt(rawPage, 10)) : 1;

  return { category, page };
}

export interface ArticleListing {
  categories: string[];
  category: string;
  /** Página vigente, acotada al total (pedir la 40 de 3 enseña la 3). */
  page: number;
  totalPages: number;
  totalItems: number;
  items: ArticleSummary[];
}

export function selectArticles(articles: ArticleSummary[], query: ArticleListingQuery): ArticleListing {
  const categories = categoriesOf(articles);
  const category = categories.includes(query.category) ? query.category : ALL_CATEGORY;
  const filtered = category === ALL_CATEGORY ? articles : articles.filter((article) => article.category === category);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ARTICLES_PER_PAGE));
  const page = Math.min(Math.max(1, query.page), totalPages);
  const start = (page - 1) * ARTICLES_PER_PAGE;

  return {
    categories,
    category,
    page,
    totalPages,
    totalItems: filtered.length,
    items: filtered.slice(start, start + ARTICLES_PER_PAGE),
  };
}

/** URL de una vista del listado; omite los valores por defecto para que `/blog` siga siendo `/blog`. */
export function listingHref(query: ArticleListingQuery): string {
  const params = new URLSearchParams();
  if (query.category !== ALL_CATEGORY) params.set(CATEGORY_PARAM, query.category);
  if (query.page > 1) params.set(PAGE_PARAM, String(query.page));
  const search = params.toString();
  return search.length > 0 ? `/blog?${search}` : "/blog";
}
