import { cache } from "react";
import { getPayload } from "@/lib/payload/get-payload";
import { mapFaq, mapHeader, mapHero, mapPackages, mapProgram, mapTeacher } from "./home.mapper";
import type { FaqContent, HeaderContent, HeroContent, PackagesContent, ProgramContent, TeacherContent } from "./home.types";

// Home is a single logical document spread across 5 Globals. Sections each call
// their own getXData(), but the underlying fetch is deduplicated per-request via
// React's cache() so Payload is only queried once regardless of how many
// sections ask for it.
const getHomeGlobals = cache(async () => {
  const payload = await getPayload();

  const [hero, program, teacher, packages, faq] = await Promise.all([
    payload.findGlobal({ slug: "home-hero" }),
    payload.findGlobal({ slug: "home-program" }),
    payload.findGlobal({ slug: "home-teacher" }),
    payload.findGlobal({ slug: "home-packages" }),
    payload.findGlobal({ slug: "home-faq" }),
  ]);

  return { hero, program, teacher, packages, faq };
});

// Header renders on every page, not just the Home, so it's kept as its own
// cached fetch separate from the rest of the Home globals.
const getHeaderGlobal = cache(async () => {
  const payload = await getPayload();
  return payload.findGlobal({ slug: "home-header" });
});

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
