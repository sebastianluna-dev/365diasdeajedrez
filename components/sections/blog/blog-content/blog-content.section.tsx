import { getPosts } from "@/services/posts/posts.service";
import { ArticleCard } from "./article-card.comp";
import { HeroArticle } from "./hero-article.comp";
import { SidebarCard } from "./sidebar-card.comp";
import { ReadingList } from "./reading-list.comp";
import { SubscribeBox } from "./subscribe-box.comp";
import "./blog-content.section.css";

export async function BlogContent() {
  const posts = await getPosts();
  const [hero, ...rest] = posts;
  if (!hero) return null;

  return (
    <section className="blog-content">
      <div className="portada">
        <div className="portada__left">
          {rest.slice(0, 2).map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>

        <div className="portada__center">
          <HeroArticle post={hero} />
        </div>

        <div className="portada__right">
          <SidebarCard />
          <ReadingList posts={rest.slice(0, 3)} />
          <SubscribeBox />
        </div>
      </div>
    </section>
  );
}
