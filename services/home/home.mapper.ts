import type { HomeHeader, HomeHero, HomeProgram, HomeTeacher, HomePackage, HomeFaq, HomeCta } from "@/payload-types";
import type { MoveAnnotations } from "@/hooks/use-chess-replay.hook";
import { mapContentImage } from "@/services/shared/map-content-image";
import type {
  CtaContent,
  FaqContent,
  HeaderContent,
  HeroContent,
  PackagePlanContent,
  PackagesContent,
  ProgramContent,
  TeacherContent,
} from "./home.types";

export function mapHeader(header: HomeHeader): HeaderContent {
  return {
    ctaLabel: header.ctaLabel,
    navItems: (header.navItems ?? []).map((item) =>
      item.blockType === "navLink"
        ? { type: "link" as const, label: item.label, href: item.href }
        : {
            type: "dropdown" as const,
            label: item.label,
            links: item.links.map((link) => ({ label: link.label, href: link.href })),
          },
    ),
  };
}

export function mapHero(hero: HomeHero): HeroContent {
  return {
    title: hero.title,
    description: hero.description,
    image: mapContentImage(hero.image),
    cta: { label: hero.cta.label, href: hero.cta.href },
  };
}

export function mapProgram(program: HomeProgram): ProgramContent {
  return {
    sectionTitle: program.sectionTitle,
    sectionDescription: program.sectionDescription,
    note: program.note ?? undefined,
    topicsHeading: program.topicsHeading,
    modules: program.modules.map((module) => ({
      title: module.title,
      durationLabel: module.durationLabel,
      subtitle: module.subtitle ?? undefined,
      description: module.description,
      topics: module.topics ?? [],
    })),
  };
}

export function mapTeacher(teacher: HomeTeacher): TeacherContent {
  return {
    eyebrow: teacher.eyebrow,
    name: teacher.name,
    badge: teacher.badge,
    summary: teacher.summary,
    photo: mapContentImage(teacher.photo),
    ctaLabel: teacher.ctaLabel,
    stats: teacher.stats.map((stat) => ({ value: stat.value, label: stat.label })),
    eloLabel: teacher.eloLabel,
    eloRatings: teacher.eloRatings.map((rating) => ({ label: rating.label, value: rating.value })),
    game: {
      title: teacher.game.title,
      paragraphs: teacher.game.paragraphs.map((paragraph) => paragraph.text),
      moves: teacher.game.moves.split(" "),
      flipBoard: teacher.game.flipBoard ?? false,
      annotations: teacher.game.annotations ? (teacher.game.annotations as MoveAnnotations) : undefined,
    },
  };
}

function mapPackagePlan(plan: HomePackage["packageOne"]): PackagePlanContent {
  return {
    name: plan.name,
    price: plan.price,
    previousPrice: plan.previousPrice ?? undefined,
    discountPercent: plan.discountPercent ?? undefined,
    currency: plan.currency,
    period: plan.period,
    description: plan.description,
    features: plan.features,
    ctaLabel: plan.ctaLabel,
    ctaUrl: plan.ctaUrl,
    featured: plan.featured ?? false,
  };
}

export function mapPackages(packages: HomePackage): PackagesContent {
  return {
    sectionTitle: packages.sectionTitle,
    sectionDescription: packages.sectionDescription,
    plans: [mapPackagePlan(packages.packageOne), mapPackagePlan(packages.packageTwo)],
  };
}

export function mapFaq(faq: HomeFaq): FaqContent {
  return {
    eyebrow: faq.eyebrow,
    sectionTitle: faq.sectionTitle,
    sectionDescription: faq.sectionDescription,
    ctaLabel: faq.ctaLabel,
    questions: faq.questions.map((question) => ({ question: question.question, answer: question.answer })),
  };
}

export function mapCta(cta: HomeCta): CtaContent {
  return {
    title: cta.title,
    subtitle: cta.subtitle,
    ctaLabel: cta.ctaLabel,
  };
}
