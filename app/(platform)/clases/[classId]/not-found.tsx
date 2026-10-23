import Link from "next/link";
import { mdButton } from "@/lib/material/material-classes";
import { platformRoutes } from "@/lib/platform-routes";

/**
 * A class the student has no seat in, or that does not exist: the new
 * design system's workspace, with the word in its panel and the way back.
 */
export default function ClassNotFound() {
  return (
    <div className="platform-page platform-page_width_full platform-page_frame_bleed">
      <div className="platform-workspace">
        <div className="platform-workspace__side" />
        <section className="platform-workspace__panel" aria-labelledby="clase-no-disponible">
          <header className="platform-page__head">
            <h1 id="clase-no-disponible" className="platform-page__title">
              Esta clase no está disponible
            </h1>
            <p className="platform-page__subtitle">No es una de tus clases, o el enlace está mal escrito.</p>
          </header>
          <p>
            <Link href={platformRoutes.classes} className={mdButton("filled", "sm")}>
              Ver mis clases
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
