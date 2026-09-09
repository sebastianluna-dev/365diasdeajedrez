import { redirect } from "next/navigation";
import { LOGIN_ERROR_MESSAGES, LOGIN_ERROR_PARAM, RETURN_TO_PARAM } from "@/constants/platform/auth.const";
import { LoginSection } from "@/components/sections/auth/login/login.section";
import { getSessionUser } from "@/lib/platform-auth/current-user";
import { getSessionRoles } from "@/lib/platform-auth/roles";
import { homeRouteFor } from "@/lib/platform-routes";

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(params: Record<string, string | string[] | undefined>, key: string): string {
  const value = params[key];
  return typeof value === "string" ? value : "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Comprobación real (no la optimista del proxy): quien ya tiene sesión no
  // necesita ver el formulario y va a la portada de su rol, igual que tras el
  // login. Hacerlo aquí y no en el proxy evita el bucle que provocaría una
  // cookie caducada. Las dos llamadas comparten la consulta de sesión.
  if (await getSessionUser()) redirect(homeRouteFor(await getSessionRoles()));

  const params = await searchParams;

  return (
    <LoginSection
      returnTo={readParam(params, RETURN_TO_PARAM)}
      // El código llega por la URL: sólo se pinta si está en el mapa, para que
      // nadie pueda inyectar texto en la página con un enlace preparado.
      errorMessage={LOGIN_ERROR_MESSAGES[readParam(params, LOGIN_ERROR_PARAM)]}
    />
  );
}
