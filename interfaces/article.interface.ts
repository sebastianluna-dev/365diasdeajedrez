export interface ArticleAuthor {
  name: string;
  role: string;
  avatar: string;
}

export interface Article {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  href: string;
  image?: string;
  meta?: string;
  readTime?: string;
  author?: ArticleAuthor;
}
