import type { Metadata } from "next";
import { ClassGamesSection } from "@/components/platform/sections/studies/class-games/class-games.section";

export const metadata: Metadata = {
  title: "Partidas de mis clases",
};

/**
 * Fixed segment, so it wins over `/estudios/[studyId]`: "clases" can never be
 * the id of a database because it is 6 characters long and ids are 8. That is
 * the invariant the fixed routes of this area — "clases" and "nueva" — rely
 * on: none of them is 8 characters, so none can be mistaken for an identifier.
 *
 * No `getCurrentUser()` here because the section makes its first await
 * against the service, which already resolves the identity in the DAL.
 */
export default function ClassGamesPage() {
  return (
    <div className="platform-page">
      <ClassGamesSection />
    </div>
  );
}
