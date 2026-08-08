export interface MentorAchievement {
  year: string;
  title: string;
  text: string;
}

export interface MentorTestimonial {
  name: string;
  detail: string;
  text: string;
}

type ShortFideTitle = "GM" | "IM" | "FM" | "CM" | "NM" | "WGM" | "WIM" | "WFM" | "WCM" | "WNM";
type LongFideTitle =
  | "Grandmaster"
  | "International Master"
  | "FIDE Master"
  | "Candidate Master"
  | "National Master"
  | "Woman Grandmaster"
  | "Woman International Master"
  | "Woman FIDE Master"
  | "Woman Candidate Master"
  | "Woman National Master"
  | "Instructor · Jugador federado FIDE";

interface MentorFeaturedGame {
  gameTitle: string;
  gameText: string;
  gameNote: string;
  flipBoard: boolean;
  moves: string[];
}

export interface FideInformation {
  fideId: string;
  standardElo: number;
  rapidElo: number;
  blitzElo: number;
  chessComElo?: number;
  federation: string;
  shortFideTitle?: ShortFideTitle;
  longFideTitle?: LongFideTitle;
}

export interface Mentor {
  slug: string;
  name: string;
  fullName: string;
  firstName: string;
  city: string;
  photo: string;
  photoFocus: string;
  birthYear: number;
  gender: "male" | "female";
  summary: string;
  shortDescription: string;
  fideInfo: FideInformation;
  achievements: MentorAchievement[];
  testimonials: MentorTestimonial[];
  featuredGame: MentorFeaturedGame;
}
