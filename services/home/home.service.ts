import { unstable_cache } from "next/cache";
import { cache } from "react";
import { CACHE_TAGS } from "@/lib/payload/cache-tags";
import { getPayload } from "@/lib/payload/get-payload";
import { mapFaq, mapReviews } from "./home.mapper";
import type { FaqContent, ReviewsContent } from "./home.types";

// What the home page still reads from the CMS since its new design
// (2026-10-26): the FAQ's questions and the testimonials. The rest of its copy
// is config/academy-home.config.ts; the Globals of the old sections (hero,
// programme, teacher, packages, sticky CTA) stay in Payload, unread.
//
// Home is a single logical document spread across several Globals. Sections each
// call their own getXData(), but the underlying fetch is deduplicated per-request
// via React's cache() so Payload is only queried once regardless of how many
// sections ask for it.
//
// And BETWEEN requests `unstable_cache` keeps it. The home page renders per
// request (it reads the session cookie to send whoever already logged in to
// their panel), so without this every visit made its queries against a
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

    const [faq, reviews] = await Promise.all([
      payload.findGlobal({ slug: "home-faq" }),
      payload.findGlobal({ slug: "home-reviews" }),
    ]);

    return { faq, reviews };
  },
  ["home-globals"],
  { tags: [CACHE_TAGS.home], revalidate: CACHE_REVALIDATE_SECONDS },
);
const getHomeGlobals = cache(readHomeGlobals);

export async function getFaqData(): Promise<FaqContent> {
  const { faq } = await getHomeGlobals();
  return mapFaq(faq);
}

export async function getReviewsData(): Promise<ReviewsContent> {
  const { reviews } = await getHomeGlobals();
  return mapReviews(reviews);
}
