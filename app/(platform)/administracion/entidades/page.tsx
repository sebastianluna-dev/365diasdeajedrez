import type { Metadata } from "next";
import { EntitiesAdminSection } from "@/components/platform/sections/staff/entities/entities-admin.section";
import { requireStaff } from "@/lib/platform-auth/roles";
import { listSourceEntities, listSourceEntityKinds } from "@/services/staff-sources/staff-sources.service";

// The title is resolved with the role, like the page itself: without it the
// response carries not even the panel's name (IMPROVEMENTS #26).
export async function generateMetadata(): Promise<Metadata> {
  await requireStaff();
  return { title: "Entidades" };
}

interface StaffEntitiesPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function StaffEntitiesPage({ searchParams }: StaffEntitiesPageProps) {
  await requireStaff();
  const [entities, kinds, { error }] = await Promise.all([listSourceEntities(), listSourceEntityKinds(), searchParams]);

  return (
    <div className="platform-page staff-entities-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Entidades</h1>
        <p className="platform-page__subtitle">
          Plataformas, editoriales y proveedores de los que procede el material de los cursos. Se crean una vez y se
          citan desde la procedencia de cada curso.
        </p>
      </header>

      <EntitiesAdminSection entities={entities} kinds={kinds} errorCode={error} />
    </div>
  );
}
