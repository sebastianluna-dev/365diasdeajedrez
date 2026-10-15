import Link from "next/link";
import { teacherRoutes } from "@/lib/platform-routes";

/** A class that is not this teacher's, or does not exist. */
export default function TeacherClassNotFound() {
  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Esta clase no está disponible</h1>
        <p className="platform-page__subtitle">No es una de tus clases, o el enlace está mal escrito.</p>
      </header>
      <p>
        <Link href={teacherRoutes.classes} className="platform-button">
          Volver a Clases que imparto
        </Link>
      </p>
    </div>
  );
}
