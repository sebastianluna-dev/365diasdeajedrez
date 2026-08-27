import type { CalloutBlock } from "@/payload-types";
import "./callout-block.comp.css";

export function CalloutBlockRenderer({ title, content, type }: CalloutBlock) {
  return (
    <div className={`rich-callout rich-callout_type_${type}`}>
      {title && <p className="rich-callout__title">{title}</p>}
      <p className="rich-callout__content">{content}</p>
    </div>
  );
}
