import { revalidatePath, revalidateTag } from "next/cache";
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { CACHE_TAGS } from "./cache-tags";

// On saving or deleting an article the cached list (`getArticleSummaries` and
// `getArticleLinks`) expires and the pages that render it are regenerated.
// `expire: 0` because this runs inside Payload's API, not in a render: the
// change has to be seen on the next visit, not when the deadline runs out.
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
