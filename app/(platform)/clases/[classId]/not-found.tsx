import Link from "next/link";
import { platformRoutes } from "@/lib/platform-routes";

/** A class the student has no seat in, or that does not exist. */
export default function ClassNotFound() {
  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Esta clase no está disponible</h1>
        <p className="platform-page__subtitle">No es una de tus clases, o el enlace está mal escrito.</p>
      </header>
      <p>
        <Link href={platformRoutes.classes} className="platform-button">
          Ver mis clases
        </Link>
      </p>
    </div>
  );
}
