import Link from "next/link";
import Image from "next/image";
import "./blog-resource-card.comp.css";

interface BlogResourceCardProps {
  title: string;
  text: string;
  image: string;
  href: string;
}

export function BlogResourceCard({ title, text, image, href }: BlogResourceCardProps) {
  return (
    <Link href={href} className="resource-card">
      <div className="resource-card__image-frame">
        <Image className="resource-card__image" src={image} alt={title} fill sizes="(max-width: 720px) 260px, 300px" />
      </div>
      <div className="resource-card__body">
        <h3 className="resource-card__title">{title}</h3>
        <p className="resource-card__text">{text}</p>
      </div>
    </Link>
  );
}
