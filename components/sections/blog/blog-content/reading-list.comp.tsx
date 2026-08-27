import Link from "next/link";
import type { PostContent } from "@/services/posts/posts.types";
import { formatTwoDigitNumber } from "@/lib/format-two-digit-number";
import "./reading-list.comp.css";

interface ReadingListProps {
  posts: PostContent[];
}

export function ReadingList({ posts }: ReadingListProps) {
  return (
    <div className="reading-list">
      <h4 className="reading-list__title">Lo más leído</h4>
      {posts.map((post, index) => (
        <Link key={post.slug} href={post.href} className="reading-list__link">
          <span className="reading-list__index">{formatTwoDigitNumber(index + 1)}</span>
          <span className="reading-list__label">{post.title}</span>
        </Link>
      ))}
    </div>
  );
}
