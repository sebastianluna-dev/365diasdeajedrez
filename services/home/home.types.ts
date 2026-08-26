import type { MoveAnnotations } from "@/hooks/use-chess-replay.hook";

export interface ContentImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface HeaderNavLink {
  type: "link";
  label: string;
  href: string;
}

export interface HeaderNavDropdown {
  type: "dropdown";
  label: string;
  links: { label: string; href: string }[];
}

export type HeaderNavItem = HeaderNavLink | HeaderNavDropdown;

export interface HeaderContent {
  ctaLabel: string;
  navItems: HeaderNavItem[];
}

export interface HeroContent {
  title: string;
  description: string;
  image: ContentImage;
  cta: {
    label: string;
    href: string;
  };
}

export interface ProgramModuleContent {
  title: string;
  durationLabel: string;
  subtitle?: string;
  description: string;
  topics: string[];
}

export interface ProgramContent {
  sectionTitle: string;
  sectionDescription: string;
  note?: string;
  modules: ProgramModuleContent[];
}

export interface TeacherStatContent {
  value: string;
  label: string;
}

export interface TeacherEloRatingContent {
  label: string;
  value: number;
}

export interface TeacherGameContent {
  title: string;
  paragraphs: string[];
  moves: string[];
  flipBoard: boolean;
  annotations?: MoveAnnotations;
}

export interface TeacherContent {
  eyebrow: string;
  name: string;
  badge: string;
  summary: string;
  photo: ContentImage;
  ctaLabel: string;
  stats: TeacherStatContent[];
  eloLabel: string;
  eloRatings: TeacherEloRatingContent[];
  game: TeacherGameContent;
}

export interface PackagePlanContent {
  name: string;
  price: number;
  previousPrice?: number;
  discountPercent?: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  ctaLabel: string;
  featured: boolean;
}

export interface PackagesContent {
  sectionTitle: string;
  sectionDescription: string;
  plans: PackagePlanContent[];
}

export interface FaqQuestionContent {
  question: string;
  answer: string;
}

export interface FaqContent {
  eyebrow: string;
  sectionTitle: string;
  sectionDescription: string;
  ctaLabel: string;
  questions: FaqQuestionContent[];
}
