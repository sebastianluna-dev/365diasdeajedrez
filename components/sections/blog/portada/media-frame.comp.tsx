import "./media-frame.comp.css";

interface MediaFrameProps {
  src: string;
  alt: string;
  badge?: string;
  marginBottom?: boolean;
}

export function MediaFrame({ src, alt, badge, marginBottom }: MediaFrameProps) {
  return (
    <div className={`media-frame${marginBottom ? " media-frame_margin_bottom" : ""}`}>
      <img className="media-frame__image" src={src} alt={alt} />
      {badge && <span className="media-frame__badge">{badge}</span>}
    </div>
  );
}
