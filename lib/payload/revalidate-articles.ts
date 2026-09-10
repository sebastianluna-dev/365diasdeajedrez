import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { CACHE_TAGS } from "./cache-tags";

// Al guardar o borrar un artículo caduca la lista cacheada (`getArticleSummaries`
// y `getArticleLinks`) y se regeneran las páginas que la pintan. `expire: 0`
// porque esto corre dentro de la API de Payload, no en un render: el cambio
// tiene que verse en la siguiente visita, no cuando venza el plazo.
function revalidateArticles(): void {
  revalidateTag(CACHE_TAGS.articles, { expire: 0 });
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

export const revalidateArticlesAfterChange: CollectionAfterChangeHook = ({ doc }) => {
  revalidateArticles();
  return doc;
};

export const revalidateArticlesAfterDelete: CollectionAfterDeleteHook = ({ doc }) => {
  revalidateArticles();
  return doc;
};
