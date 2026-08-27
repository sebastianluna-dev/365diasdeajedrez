import type { HomeMentors } from "@/payload-types";
import { mapContentImage } from "@/services/shared/map-content-image";
import type { MentorContent, MentorsContent } from "./mentors.types";

function mapMentor(mentor: HomeMentors["mentors"][number]): MentorContent {
  return {
    slug: mentor.slug,
    name: mentor.name,
    lastName: mentor.lastName,
    city: mentor.city,
    birthYear: mentor.birthYear,
    gender: mentor.gender,
    photo: mapContentImage(mentor.photo),
    photoFocus: mentor.photoFocus ?? undefined,
    shortDescription: mentor.shortDescription,
    summary: mentor.summary,
    fideInfo: {
      fideId: mentor.fideId,
      federation: mentor.federation,
      standardElo: mentor.standardElo,
      rapidElo: mentor.rapidElo,
      blitzElo: mentor.blitzElo,
      chessComElo: mentor.chessComElo ?? undefined,
      shortFideTitle: mentor.shortFideTitle ?? undefined,
      longFideTitle: mentor.longFideTitle ?? undefined,
    },
    achievements: (mentor.achievements ?? []).map((achievement) => ({
      year: achievement.year,
      title: achievement.title,
      text: achievement.text,
    })),
    testimonials: (mentor.testimonials ?? []).map((testimonial) => ({
      name: testimonial.name,
      detail: testimonial.detail,
      text: testimonial.text,
    })),
    featuredGame: {
      gameTitle: mentor.featuredGame.gameTitle,
      gameText: mentor.featuredGame.gameText,
      gameNote: mentor.featuredGame.gameNote,
      moves: mentor.featuredGame.moves,
      flipBoard: mentor.featuredGame.flipBoard ?? false,
    },
  };
}

export function mapMentors(homeMentors: HomeMentors): MentorsContent {
  return {
    eyebrow: homeMentors.eyebrow,
    sectionTitle: homeMentors.sectionTitle,
    sectionDescription: homeMentors.sectionDescription,
    mentors: homeMentors.mentors.map(mapMentor),
  };
}
