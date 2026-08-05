export interface ArticleAuthor {
  name: string;
  role: string;
  avatar?: string;
}

export type ArticleBodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: { lead: string; text: string }[] }
  | { type: "quote"; text: string };

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
  body?: ArticleBodyBlock[];
}
