import type { Metadata } from "next";
import { ClassGamesSection } from "@/components/sections/platform/studies/class-games/class-games.section";

export const metadata: Metadata = {
  title: "Partidas de mis clases",
};

/**
 * Segmento fijo, así que gana a `/estudios/[studyId]`: «clases» nunca puede
 * ser el id de una base porque los ids son uuid.
 *
 * Sin `getCurrentUser()` aquí porque la sección hace su primer await contra el
 * servicio, que ya resuelve la identidad en el DAL.
 */
export default function ClassGamesPage() {
  return (
    <div className="platform-page">
      <ClassGamesSection />
    </div>
  );
}
