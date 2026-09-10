import { describe, expect, it } from "vitest";
import { ALL_CATEGORY, categoriesOf, listingHref, parseListingQuery, selectArticles } from "./article-listing";
import type { ArticleSummary } from "./articles.types";

function article(slug: string, category?: string): ArticleSummary {
  return {
    slug,
    href: `/blog/${slug}`,
    title: slug,
    excerpt: "",
    category,
    image: { src: "/x.jpg", alt: "" },
    meta: "",
  };
}

const ARTICLES = [
  ...Array.from({ length: 12 }, (_, index) => article(`tactica-${index}`, "Táctica")),
  article("final-1", "Finales"),
  article("sin-categoria"),
];

describe("categoriesOf", () => {
  it("pone «Todos» delante y conserva el orden de aparición sin repetir", () => {
    expect(categoriesOf(ARTICLES)).toEqual([ALL_CATEGORY, "Táctica", "Finales"]);
  });
});

describe("parseListingQuery", () => {
  const categories = categoriesOf(ARTICLES);

  it("acepta categoría y página válidas", () => {
    expect(parseListingQuery({ categoria: "Finales", pagina: "2" }, categories)).toEqual({
      category: "Finales",
      page: 2,
    });
  });

  it("vuelve a los valores por defecto ante cualquier cosa rara", () => {
    expect(parseListingQuery({}, categories)).toEqual({ category: ALL_CATEGORY, page: 1 });
    expect(parseListingQuery({ categoria: "Inventada", pagina: "abc" }, categories)).toEqual({
      category: ALL_CATEGORY,
      page: 1,
    });
    expect(parseListingQuery({ pagina: "0" }, categories).page).toBe(1);
    expect(parseListingQuery({ pagina: ["3", "9"] }, categories).page).toBe(3);
  });
});

describe("selectArticles", () => {
  it("pagina de nueve en nueve y acota la página al total", () => {
    const first = selectArticles(ARTICLES, { category: ALL_CATEGORY, page: 1 });
    expect(first.items).toHaveLength(9);
    expect(first.totalPages).toBe(2);
    expect(first.totalItems).toBe(14);

    const beyond = selectArticles(ARTICLES, { category: ALL_CATEGORY, page: 40 });
    expect(beyond.page).toBe(2);
    expect(beyond.items).toHaveLength(5);
  });

  it("filtra por categoría", () => {
    const finals = selectArticles(ARTICLES, { category: "Finales", page: 1 });
    expect(finals.items.map((item) => item.slug)).toEqual(["final-1"]);
    expect(finals.totalPages).toBe(1);
  });
});

describe("listingHref", () => {
  it("omite los valores por defecto y codifica el resto", () => {
    expect(listingHref({ category: ALL_CATEGORY, page: 1 })).toBe("/blog");
    expect(listingHref({ category: ALL_CATEGORY, page: 2 })).toBe("/blog?pagina=2");
    expect(listingHref({ category: "Táctica", page: 3 })).toBe("/blog?categoria=T%C3%A1ctica&pagina=3");
  });
});
