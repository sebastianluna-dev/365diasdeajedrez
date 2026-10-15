import Link from "next/link";
import { staffRoutes } from "@/lib/platform-routes";

/** A class id that leads nowhere. */
export default function StaffClassNotFound() {
  return (
    <div className="platform-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Esta clase no existe</h1>
        <p className="platform-page__subtitle">Puede que el enlace esté mal escrito o que la clase nunca existiera.</p>
      </header>
      <p>
        <Link href={staffRoutes.classes} className="platform-button">
          Volver a Clases
        </Link>
      </p>
    </div>
  );
}
