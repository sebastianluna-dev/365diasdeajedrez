import type { Metadata } from "next";
import { CreateAccountForm } from "@/components/sections/platform/staff/students/create-account-form.comp";
import { requireStaff } from "@/lib/platform-auth/roles";

export const metadata: Metadata = {
  title: "Registrar alumno",
};

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
