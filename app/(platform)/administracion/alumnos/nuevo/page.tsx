import type { Metadata } from "next";
import { CreateAccountForm } from "@/components/platform/sections/staff/students/create-account-form.comp";
import { requireStaff } from "@/lib/platform-auth/roles";

// The title is resolved with the role, like the page itself: without it the
// response carries not even the panel's name (IMPROVEMENTS #26).
export async function generateMetadata(): Promise<Metadata> {
  await requireStaff();
  return { title: "Registrar alumno" };
}

export default async function NewStudentPage() {
  await requireStaff();

  return (
    <div className="platform-page staff-new-student-page">
      <header className="platform-page__head">
        <h1 className="platform-page__title">Registrar alumno</h1>
        <p className="platform-page__subtitle">
          La plataforma no tiene registro público: las cuentas se crean aquí y la contraseña se entrega a mano.
        </p>
      </header>

      <CreateAccountForm />
    </div>
  );
}
