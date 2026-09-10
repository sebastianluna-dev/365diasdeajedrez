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
// And BETWEEN requests `unstable_cache` keeps it. The home page renders per
// request (it reads the session cookie to send whoever already logged in to
// their panel), so without this every visit made the seven queries against a
// remote database: it was almost all of the response time. The Globals'
// `afterChange` hooks expire the tag on save in the CMS
// (lib/payload/revalidate-*); the one-hour window is only the safety net for
// changes that do not go through Payload (seed, SQL by hand).
//
// `unstable_cache` and not `"use cache"`: the directive requires
// `cacheComponents`, which the platform does not have enabled yet (see
// app/(platform)/layout.tsx).
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
