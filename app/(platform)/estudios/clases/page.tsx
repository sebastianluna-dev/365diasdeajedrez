import type { Metadata } from "next";
import { ClassGamesSection } from "@/components/sections/platform/studies/class-games/class-games.section";

export const metadata: Metadata = {
  title: "Partidas de mis clases",
};

/**
 * Segmento fijo, así que gana a `/estudios/[studyId]`: «clases» nunca puede ser
 * el id de una base porque mide 6 caracteres y los ids miden 8. Es la invariante
 * de la que dependen las rutas fijas de esta zona —«clases» y «nueva»—: ninguna
 * mide 8, así que ninguna puede confundirse con un identificador.
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
