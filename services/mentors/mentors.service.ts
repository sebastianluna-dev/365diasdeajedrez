import { cache } from "react";
import { getPayload } from "@/lib/payload/get-payload";
import { mapMentors } from "./mentors.mapper";
import type { MentorContent, MentorsContent } from "./mentors.types";

const getHomeMentorsGlobal = cache(async () => {
  const payload = await getPayload();
  return payload.findGlobal({ slug: "home-mentors" });
});

export async function getMentorsData(): Promise<MentorsContent> {
  const homeMentors = await getHomeMentorsGlobal();
  return mapMentors(homeMentors);
}

export async function getMentorBySlug(slug: string): Promise<MentorContent | undefined> {
  const { mentors } = await getMentorsData();
  return mentors.find((mentor) => mentor.slug === slug);
}
