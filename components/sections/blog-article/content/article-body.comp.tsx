import type { ArticleBodyBlock } from "@/interfaces/article.interface";
import "./article-body.comp.css";

interface ArticleBodyProps {
  blocks: ArticleBodyBlock[];
}

export function ArticleBody({ blocks }: ArticleBodyProps) {
  return (
    <div className="article-body">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p key={index} className="article-body__paragraph">
              {block.text}
            </p>
          );
        }
        if (block.type === "heading") {
          return (
            <h2 key={index} className="article-body__heading">
              {block.text}
            </h2>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={index} className="article-body__list">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <span className="article-body__list-lead">{item.lead}</span> {item.text}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={index} className="article-body__quote">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
