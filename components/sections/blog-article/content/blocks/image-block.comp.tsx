import Image from "next/image";
import type { ImageBlock } from "@/payload-types";
import { mapContentImage } from "@/services/shared/map-content-image";
import "./image-block.comp.css";

export function ImageBlockRenderer({ image, alt, caption }: ImageBlock) {
  const content = mapContentImage(image);

  return (
    <figure className="rich-image-block">
      <div className="rich-image-block__frame">
        <Image src={content.src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 780px" />
      </div>
      {caption && <figcaption className="rich-image-block__caption">{caption}</figcaption>}
    </figure>
  );
}
