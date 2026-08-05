import Link from "next/link";
import { MediaFrame } from "./media-frame.comp";
import "./article-card.comp.css";

interface ArticleCardProps {
  id?: string;
  image?: { src: string; alt: string };
  eyebrow: string;
  title: string;
  text: string;
  href: string;
}

export function ArticleCard({ id, image, eyebrow, title, text, href }: ArticleCardProps) {
  return (
    <article id={id} className="article-card">
      {image && <MediaFrame src={image.src} alt={image.alt} marginBottom />}
      <span className="eyebrow">{eyebrow}</span>
      <h3 className="article-card__title">{title}</h3>
      <p className="article-card__text">{text}</p>
      <Link href={href} className="article-card__link">
        Leer <span className="link-arrow">⟶</span>
      </Link>
    </article>
  );
}
