import { redirect } from "next/navigation";
import { LOGIN_ERROR_MESSAGES, LOGIN_ERROR_PARAM, RETURN_TO_PARAM } from "@/constants/platform/auth.const";
import { LoginSection } from "@/components/auth/sections/login/login.section";
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
  // Real check (not the proxy's optimistic one): whoever already has a session
  // does not need to see the form and goes to their role's home, just like after
  // login. Doing it here and not in the proxy avoids the loop an expired cookie
  // would cause. The two calls share the session query.
  if (await getSessionUser()) redirect(homeRouteFor(await getSessionRoles()));

  const params = await searchParams;

  return (
    <LoginSection
      returnTo={readParam(params, RETURN_TO_PARAM)}
      // The code arrives through the URL: it is only rendered when it is in the map,
      // so nobody can inject text into the page with a crafted link.
      errorMessage={LOGIN_ERROR_MESSAGES[readParam(params, LOGIN_ERROR_PARAM)]}
    />
  );
}
