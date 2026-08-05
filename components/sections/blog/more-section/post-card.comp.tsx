import "./post-card.comp.css";

interface PostCardProps {
  id?: string;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  meta: string;
}

export function PostCard({ id, image, category, title, excerpt, meta }: PostCardProps) {
  return (
    <article id={id} className="post-card">
      <img className="post-card__image" src={image} alt={title} />
      <span className="eyebrow">{category}</span>
      <h3 className="post-card__title">{title}</h3>
      <p className="post-card__text">{excerpt}</p>
      <span className="card-meta">{meta}</span>
    </article>
  );
}
