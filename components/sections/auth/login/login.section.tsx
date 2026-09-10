import Link from "next/link";
import { RETURN_TO_PARAM } from "@/constants/platform/auth.const";
import { loginAction } from "@/services/auth/auth.actions";
import { LoginSubmit } from "./login-submit.comp";
import "./login.section.css";

interface LoginSectionProps {
  /** Internal path to return to after logging in; empty = the student's panel. */
  returnTo: string;
  /** Message from the previous attempt, if there was one. */
  errorMessage?: string;
}

export function LoginSection({ returnTo, errorMessage }: LoginSectionProps) {
  return (
    <main id="contenido" className="login">
      <div className="login__card">
        <Link href="/" className="login__logo">
          365 Días<span className="login__logo-accent"> de Ajedrez</span>
        </Link>

        <div className="login__head">
          <h1 className="login__title">Accede a tu plataforma</h1>
          <p className="login__subtitle">Entra con el correo con el que te dio de alta la academia.</p>
        </div>

        <form className="login__form" action={loginAction}>
          <input type="hidden" name={RETURN_TO_PARAM} value={returnTo} />

          <label className="login__field">
            <span className="login__label">Correo</span>
            <input
              className="login__input"
              type="email"
              name="email"
              autoComplete="username"
              maxLength={254}
              required
              autoFocus
            />
          </label>

          <label className="login__field">
            <span className="login__label">Contraseña</span>
            <input
              className="login__input"
              type="password"
              name="password"
              autoComplete="current-password"
              maxLength={200}
              required
            />
          </label>

          {/* role=alert so a screen reader announces the failure on returning
              from the submit, without the user having to look for it. */}
          {errorMessage && (
            <p className="login__error" role="alert">
              {errorMessage}
            </p>
          )}

          <LoginSubmit />
        </form>

        <p className="login__help">¿No puedes entrar? Escribe a la academia y te ayudamos a recuperar el acceso.</p>
      </div>
    </main>
  );
}
