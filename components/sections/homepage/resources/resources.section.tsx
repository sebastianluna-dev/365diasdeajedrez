"use client";

import { useState } from "react";
import Link from "next/link";
import { articles } from "@/data/articles.data";
import { videos } from "@/data/videos.data";
import { BlogResourceCard } from "./blog-resource-card.comp";
import { VideoResourceCard } from "./video-resource-card.comp";
import "./resources.section.css";

const resourceSlugs = ["estrategia", "tactica", "aperturas"];
const blogResources = resourceSlugs.map((slug) => articles.find((article) => article.slug === slug)!);

type ResourceTab = "articles" | "videos";

export function ResourcesSection() {
  const [tab, setTab] = useState<ResourceTab>("articles");

  return (
    <section id="blog" className="section section_theme_dark resources">
      <div className="section__inner">
        <div className="section__head">
          <div>
            <span className="section__eyebrow">Recursos</span>
            <h2 className="section__title">Material de estudio para todos los niveles.</h2>
            <p className="section__text">Artículos, ideas y ejercicios para seguir aprendiendo entre clases.</p>
          </div>
          <Link href={tab === "articles" ? "/blog" : "/videos"} className="button button_variant_primary">
            Ver más
          </Link>
        </div>

        <div className="resources__grid">
          <div className="resources__tabs">
            <button
              type="button"
              onClick={() => setTab("articles")}
              className={`resources__tab${tab === "articles" ? " resources__tab_active" : ""}`}
            >
              Artículos
            </button>
            <button
              type="button"
              onClick={() => setTab("videos")}
              className={`resources__tab${tab === "videos" ? " resources__tab_active" : ""}`}
            >
              Videos
            </button>
          </div>
          <div className="resources__cards">
            {tab === "articles"
              ? blogResources.map((article) => (
                  <BlogResourceCard
                    key={article.slug}
                    title={article.title}
                    text={article.excerpt}
                    image={article.image!}
                    href={article.href}
                  />
                ))
              : videos.map((video) => <VideoResourceCard key={video.slug} video={video} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
