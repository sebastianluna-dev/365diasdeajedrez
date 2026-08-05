import Image from "next/image";
import type { VideoResource } from "@/interfaces/video-resource.interface";
import { DEFAULT_VIDEO_THUMBNAIL } from "@/data/media-defaults.data";
import "./video-resource-card.comp.css";

interface VideoResourceCardProps {
  video: VideoResource;
}

export function VideoResourceCard({ video }: VideoResourceCardProps) {
  return (
    <article className="resource-card">
      <div className="resource-card__image-frame">
        <Image
          className="resource-card__image"
          src={video.image ?? DEFAULT_VIDEO_THUMBNAIL}
          alt={video.title}
          fill
          sizes="(max-width: 720px) 260px, 300px"
        />
        <span className="video-resource-card__duration">{video.duration}</span>
      </div>
      <div className="resource-card__body">
        <h3 className="resource-card__title">{video.title}</h3>
        <p className="resource-card__text">{video.description}</p>
      </div>
    </article>
  );
}
