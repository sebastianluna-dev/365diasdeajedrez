import type { ContentImage } from "@/services/shared/content-image.types";

export interface MentorAchievementContent {
  year: string;
  title: string;
  text: string;
}

export interface MentorTestimonialContent {
  name: string;
  detail: string;
  text: string;
}

export interface MentorFeaturedGameContent {
  gameTitle: string;
  gameText: string;
  gameNote: string;
  moves: string;
  flipBoard: boolean;
}

export interface MentorFideInfoContent {
  fideId: string;
  federation: string;
  standardElo: number;
  rapidElo: number;
  blitzElo: number;
  chessComElo?: number;
  shortFideTitle?: string;
  longFideTitle?: string;
}

export interface MentorContent {
  slug: string;
  name: string;
  lastName: string;
  city: string;
  birthYear: number;
  gender: "male" | "female";
  photo: ContentImage;
  photoFocus?: string;
  shortDescription: string;
  summary: string;
  fideInfo: MentorFideInfoContent;
  achievements: MentorAchievementContent[];
  testimonials: MentorTestimonialContent[];
  featuredGame: MentorFeaturedGameContent;
}

export interface MentorsContent {
  eyebrow: string;
  sectionTitle: string;
  sectionDescription: string;
  mentors: MentorContent[];
}
