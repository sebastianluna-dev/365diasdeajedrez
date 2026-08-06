import Image from "next/image";
import "./media-frame.comp.css";

interface MediaFrameProps {
  src: string;
  alt: string;
  badge?: string;
  marginBottom?: boolean;
  sizes?: string;
}

export function MediaFrame({ src, alt, badge, marginBottom, sizes = "100vw" }: MediaFrameProps) {
  return (
    <div className={`media-frame${marginBottom ? " media-frame_margin_bottom" : ""}`}>
      <Image className="media-frame__image" src={src} alt={alt} fill sizes={sizes} />
      {badge && <span className="media-frame__badge">{badge}</span>}
    </div>
  );
}
