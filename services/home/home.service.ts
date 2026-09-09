import { unstable_cache } from "next/cache";
import { cache } from "react";
import { CACHE_TAGS } from "@/lib/payload/cache-tags";
import { getPayload } from "@/lib/payload/get-payload";
import { mapCta, mapFaq, mapHeader, mapHero, mapPackages, mapProgram, mapReviews, mapTeacher } from "./home.mapper";
import type {
  CtaContent,
  FaqContent,
  HeaderContent,
  HeroContent,
  PackagesContent,
  ProgramContent,
  ReviewsContent,
  TeacherContent,
} from "./home.types";

// Home is a single logical document spread across several Globals. Sections each
// call their own getXData(), but the underlying fetch is deduplicated per-request
// via React's cache() so Payload is only queried once regardless of how many
// sections ask for it.
//
// Y ENTRE peticiones lo guarda `unstable_cache`. La portada se renderiza por
// petición (lee la cookie de sesión para mandar a su panel a quien ya entró),
// así que sin esto cada visita hacía las siete consultas contra una base
// remota: era casi todo el tiempo de respuesta. Los hooks `afterChange` de los
// Globals caducan la etiqueta al guardar en el CMS (lib/payload/revalidate-*);
// el plazo de una hora es sólo la red de seguridad para cambios que no pasen
// por Payload (seed, SQL a mano).
//
// `unstable_cache` y no `"use cache"`: la directiva exige `cacheComponents`,
// que la plataforma todavía no tiene activado (ver app/(platform)/layout.tsx).
const CACHE_REVALIDATE_SECONDS = 3600;

const readHomeGlobals = unstable_cache(
  async () => {
    const payload = await getPayload();

    const [hero, program, teacher, packages, faq, cta, reviews] = await Promise.all([
      payload.findGlobal({ slug: "home-hero" }),
      payload.findGlobal({ slug: "home-program" }),
      payload.findGlobal({ slug: "home-teacher" }),
      payload.findGlobal({ slug: "home-packages" }),
      payload.findGlobal({ slug: "home-faq" }),
      payload.findGlobal({ slug: "home-cta" }),
      payload.findGlobal({ slug: "home-reviews" }),
    ]);

    return { hero, program, teacher, packages, faq, cta, reviews };
  },
  ["home-globals"],
  { tags: [CACHE_TAGS.home], revalidate: CACHE_REVALIDATE_SECONDS },
);
const getHomeGlobals = cache(readHomeGlobals);

// Header renders on every page, not just the Home, so it's kept as its own
// cached fetch separate from the rest of the Home globals.
const readHeaderGlobal = unstable_cache(
  async () => {
    const payload = await getPayload();
    return payload.findGlobal({ slug: "home-header" });
  },
  ["home-header"],
  { tags: [CACHE_TAGS.header], revalidate: CACHE_REVALIDATE_SECONDS },
);
const getHeaderGlobal = cache(readHeaderGlobal);

export async function getHeaderData(): Promise<HeaderContent> {
  const header = await getHeaderGlobal();
  return mapHeader(header);
}

export async function getHeroData(): Promise<HeroContent> {
  const { hero } = await getHomeGlobals();
  return mapHero(hero);
}

export async function getProgramData(): Promise<ProgramContent> {
  const { program } = await getHomeGlobals();
  return mapProgram(program);
}

export async function getTeacherData(): Promise<TeacherContent> {
  const { teacher } = await getHomeGlobals();
  return mapTeacher(teacher);
}

export async function getPackagesData(): Promise<PackagesContent> {
  const { packages } = await getHomeGlobals();
  return mapPackages(packages);
}

export async function getFaqData(): Promise<FaqContent> {
  const { faq } = await getHomeGlobals();
  return mapFaq(faq);
}

export async function getCtaData(): Promise<CtaContent> {
  const { cta } = await getHomeGlobals();
  return mapCta(cta);
}

export async function getReviewsData(): Promise<ReviewsContent> {
  const { reviews } = await getHomeGlobals();
  return mapReviews(reviews);
}
