import type { Media } from "@/payload-types";
import { getMediaUrl } from "@/lib/payload/get-media-url";
import type { ContentImage } from "./content-image.types";

export function mapContentImage(media: number | Media): ContentImage {
  const src = getMediaUrl(media);
  // Safe: getMediaUrl throws above if `media` were still an unpopulated id.
  const populated = media as Media;
  return {
    src,
    alt: populated.alt,
    width: populated.width ?? undefined,
    height: populated.height ?? undefined,
  };
}
