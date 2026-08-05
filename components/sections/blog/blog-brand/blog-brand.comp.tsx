import Link from "next/link";
import "./blog-brand.comp.css";

interface BlogBrandProps {
  context?: "footer";
}

export function BlogBrand({ context }: BlogBrandProps) {
  const inFooter = context === "footer";

  return (
    <Link href="/" className={`blog-brand${inFooter ? " blog-brand_context_footer" : ""}`}>
      <span className={`blog-brand__accent${inFooter ? " blog-brand__accent_context_footer" : ""}`}>365</span>
      <span className={`blog-brand__label${inFooter ? " blog-brand__label_context_footer" : ""}`}>DiasDeAjedrez</span>
      <span className="blog-brand__marks">
        <span className={`blog-brand__mark${inFooter ? " blog-brand__mark_context_footer" : ""}`} />
        <span className="blog-brand__mark blog-brand__mark_hidden" />
        <span className="blog-brand__mark blog-brand__mark_hidden" />
        <span className={`blog-brand__mark${inFooter ? " blog-brand__mark_context_footer" : ""}`} />
      </span>
    </Link>
  );
}
