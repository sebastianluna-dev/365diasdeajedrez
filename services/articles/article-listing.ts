import type { ArticleSummary } from "./articles.types";

// Category filter and pagination of the blog. It is pure logic and lives outside
// the component because it is used by the page (to read the `searchParams`), the
// metadata (for the canonical) and the tests.
//
// Category and page go in the URL (`/blog?categoria=Táctica&pagina=2`) and not
// in React state: that way every page of the blog can be linked, shared, crawled
// and recovered with "back". The default values are not written.

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

/** Categories with at least one article, in order of appearance, with "Todos" first. */
export function categoriesOf(articles: ArticleSummary[]): string[] {
  const unique = new Set<string>();
  for (const article of articles) if (article.category) unique.add(article.category);
  return [ALL_CATEGORY, ...unique];
}

/** Reads the query from the URL; what does not fit falls back to the default value. */
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
  /** Current page, clamped to the total (asking for page 40 of 3 shows the 3rd). */
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

/** URL of a view of the listing; it omits the default values so `/blog` stays `/blog`. */
export function listingHref(query: ArticleListingQuery): string {
  const params = new URLSearchParams();
  if (query.category !== ALL_CATEGORY) params.set(CATEGORY_PARAM, query.category);
  if (query.page > 1) params.set(PAGE_PARAM, String(query.page));
  const search = params.toString();
  return search.length > 0 ? `/blog?${search}` : "/blog";
}
