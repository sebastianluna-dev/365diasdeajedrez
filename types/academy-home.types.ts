// The copy of the academy's home page («365 días de ajedrez», `/`), the
// sections of the owner's assembled design (2026-10-26). The CMS keeps feeding
// what it already fed (the FAQ's questions, the testimonials, the WhatsApp
// number); everything the new sections add lives in
// config/academy-home.config.ts, typed here, because adding it to Payload
// would need a migration.

/** A heading in ink with its words in blue after them («Tu clase, *desde tu plataforma*»). */
export interface HomeHeadingCopy {
  text: string;
  emphasis: string;
}

/** What every section opens with: its eyebrow, its heading and, if any, its lead. */
export interface HomeSectionHead {
  eyebrow: string;
  heading: HomeHeadingCopy;
  lead?: string;
}

/** A WhatsApp action: the button's words and the message the chat opens with. */
export interface HomeWhatsappCopy {
  label: string;
  message: string;
}

/** A board drawn still: its position, the move that led to it and what it shows. */
export interface HomeBoardCopy {
  fen: string;
  lastMove?: { from: string; to: string };
  orientation?: "white" | "black";
  /** What a screen reader hears in its place. */
  label: string;
}

/** A numbered step: its title and its line. */
export interface HomeStepCopy {
  title: string;
  text: string;
}

export interface HomeHeroCopy {
  eyebrow: string;
  heading: HomeHeadingCopy;
  lead: string;
  /** The three promises under the lead. */
  chips: string[];
  /** The secondary button, an anchor of this page. */
  secondary: { label: string; href: string };
  /** Under the buttons: what the main one does. */
  note: string;
  board: HomeBoardCopy;
  /** The card that names the board's last move. */
  caption: { move: string; title: string; text: string };
}

/** A figure of the academy. `value` stays null until the owner gives a real one (no invented stats). */
export interface HomeFigureCopy {
  value: string | null;
  label: string;
  note: string;
  icon: "users" | "calendar-clock" | "graduation-cap" | "trophy";
  shape: "cookie" | "arch" | "clover" | "square";
}

export interface HomeFiguresCopy extends HomeSectionHead {
  link: { label: string; href: string };
  items: HomeFigureCopy[];
}

export interface HomeClassesCopy extends HomeSectionHead {
  formats: { icon: "user" | "users"; title: string; text: string }[];
  /** The classroom drawn as it will be: the platform's own, still to come. */
  room: {
    label: string;
    title: string;
    meta: string;
    soon: string;
    turn: string;
    topic: string;
    moves: [string, string, string][];
    /** The move of `moves` that is lit, as «row,column». */
    current: string;
    tools: string[];
    teacher: string;
    students: string[];
    captions: { who: string; text: string };
    clock: string;
    board: HomeBoardCopy;
  };
  steps: HomeStepCopy[];
  promises: HomeStepCopy[];
  /** Under it all: how a class is joined today. */
  note: string;
}

/** A teacher of the team. The list is empty until the owner gives the real ones. */
export interface HomeTeacherCopy {
  name: string;
  title: string;
  line: string;
}

export interface HomeTeamCopy extends HomeSectionHead {
  members: HomeTeacherCopy[];
  assign: { title: string; steps: HomeStepCopy[] };
}

export interface HomeCourseChapter {
  name: string;
  about: string;
  lessons: number;
}

/** One of the academy's courses, as the platform's «Tus cursos» draws it. Static: the site never reads the platform's database. */
export interface HomeCourseCopy {
  /** Its cover's colours, a modifier of the section's sheet. */
  cover: "siciliana" | "fischer" | "torre" | "kotov";
  kicker: string;
  coverTitle: string;
  name: string;
  topic: string;
  levels: string[];
  chapters: HomeCourseChapter[];
  /** The lesson the inside view offers next, with its board when it has one. */
  next: { name: string; about: string; board?: HomeBoardCopy };
}

export interface HomeCoursesCopy extends HomeSectionHead {
  ask: HomeWhatsappCopy;
  /** The caption over the inside view. */
  inside: { say: string; note: string };
  courses: HomeCourseCopy[];
}

export interface HomePlatformCopy extends HomeSectionHead {
  features: { icon: "list-ol" | "books" | "shuffle" | "stopwatch" | "compass" | "fire"; title: string; text: string }[];
  /** The index of the feature the mock-up shows (Puzzle Rush). */
  shown: number;
  rush: {
    label: string;
    modes: { title: string; text: string }[];
    topics: string[];
    mine: string[];
    left: string;
    solved: string;
    /** The run so far: true a solved one, false a mistake. */
    run: boolean[];
    current: string;
    turn: string;
    note: string;
    board: HomeBoardCopy;
  };
  streak: { days: string; minutes: number; goal: number; text: string };
}

export interface HomeAdventureRival {
  initials: string;
  name: string;
  role: string;
  quote: string;
  /** Who it is to the player: beaten, or the next one. */
  state: "won" | "next";
  tags: string[];
}

export interface HomeAdventureCopy extends HomeSectionHead {
  facts: { icon: "trophy" | "circle-check"; title: string; text: string }[];
  streak: { strong: string; text: string };
  ask: HomeWhatsappCopy;
  map: {
    label: string;
    page: { kicker: string; title: string; text: string };
    note: string;
    hint: string;
    keepsake: string;
    hud: { title: string; rivals: string; stars: string };
  };
  rivals: HomeAdventureRival[];
}

export interface HomeInformationCopy extends HomeSectionHead {
  steps: HomeStepCopy[];
  card: { title: string; text: string; preview: string; button: string };
  promises: { strong: string; text: string }[];
}

export type HomeTestimonialsCopy = HomeSectionHead;

export interface HomeFaqCopy extends HomeSectionHead {
  help: { title: string; text: string; button: string };
}

export interface HomeClosingCopy {
  eyebrow: string;
  heading: HomeHeadingCopy;
  text: string;
  info: HomeWhatsappCopy;
  chips: { icon: "clock" | "calendar" | "users"; text: string }[];
  board: HomeBoardCopy & { turn: string; opening: string };
}

export interface AcademyHomeCopy {
  /** The main action of the page, everywhere it appears: book a trial class. */
  booking: HomeWhatsappCopy;
  hero: HomeHeroCopy;
  figures: HomeFiguresCopy;
  classes: HomeClassesCopy;
  team: HomeTeamCopy;
  courses: HomeCoursesCopy;
  platform: HomePlatformCopy;
  adventure: HomeAdventureCopy;
  information: HomeInformationCopy;
  testimonials: HomeTestimonialsCopy;
  faq: HomeFaqCopy;
  closing: HomeClosingCopy;
}
