import { cache } from "react";
import { getPayload } from "@/lib/payload/get-payload";
import { mapPost } from "./posts.mapper";
import type { PostContent } from "./posts.types";

const getPublishedPosts = cache(async () => {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "posts",
    where: { _status: { equals: "published" } },
    sort: "-publishedAt",
    limit: 0,
    depth: 2,
  });
  return result.docs;
});

export async function getPosts(): Promise<PostContent[]> {
  const posts = await getPublishedPosts();
  return posts.map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<PostContent | undefined> {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug);
}
