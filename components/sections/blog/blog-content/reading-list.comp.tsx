import Link from "next/link";
import type { Article } from "@/interfaces/article.interface";
import { formatTwoDigitNumber } from "@/lib/format-two-digit-number";
import "./reading-list.comp.css";

interface ReadingListProps {
  articles: Article[];
}

export function ReadingList({ articles }: ReadingListProps) {
  return (
    <div className="reading-list">
      <h4 className="reading-list__title">Lo más leído</h4>
      {articles.map((article, index) => (
        <Link key={article.slug} href={article.href} className="reading-list__link">
          <span className="reading-list__index">{formatTwoDigitNumber(index + 1)}</span>
          <span className="reading-list__label">{article.title}</span>
        </Link>
      ))}
    </div>
  );
}
