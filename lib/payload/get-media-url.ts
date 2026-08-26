import type { Media } from "@/payload-types";

export function getMediaUrl(media: number | Media): string {
  if (typeof media === "number") {
    throw new Error(`Expected populated Media relationship, got raw id ${media}. Increase the query depth.`);
  }
  if (!media.url) {
    throw new Error(`Media document ${media.id} has no url.`);
  }
  return media.url;
}
