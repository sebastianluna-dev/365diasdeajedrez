// Constantes de autenticación compartidas por el DAL, las server actions y
// `proxy.ts`. Van aquí (sin "server-only") porque proxy corre antes del render
// y no debe arrastrar el cliente de Prisma ni módulos de React.

export const SESSION_COOKIE_NAME = "platform_session";

/**
 * Vida de la cookie: muy larga a propósito. Quien manda sobre la caducidad es
 * `Session.expiresAt` en la base de datos, así que la cookie sólo tiene que
 * seguir ahí para transportar el token; si el navegador la conserva de más, el
 * servidor rechaza igualmente la sesión caducada.
 */
export const SESSION_COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60;

/** Duración real de una sesión sin actividad. */
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Renovación deslizante: se refresca como mucho una vez al día. */
export const SESSION_RENEW_AFTER_MS = 24 * 60 * 60 * 1000;

export const LOGIN_PATH = "/iniciar-sesion";

/** Parámetro con el destino al que volver tras iniciar sesión. */
export const RETURN_TO_PARAM = "next";

/** Parámetro con el que el login se devuelve a sí mismo el motivo del fallo. */
export const LOGIN_ERROR_PARAM = "error";

/**
 * Mensajes de error del login. Viven aquí y no en `auth.actions.ts` porque un
 * módulo "use server" sólo puede exportar funciones asíncronas.
 *
 * Un único texto para todos los fallos de credenciales a propósito: distinguir
 * «ese correo no existe» de «esa contraseña no es» le regala a un atacante la
 * lista de alumnos dados de alta.
 */
export const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  credentials: "Email o contraseña incorrectos.",
  throttled: "Demasiados intentos. Espera un minuto y vuelve a probar.",
};

/**
 * Prefijos de la zona privada. `proxy.ts` los usa para el rechazo optimista y
 * el sitemap/robots para excluirlos; la comprobación de verdad vive siempre en
 * el DAL (`getCurrentUser`), porque el proxy sólo ve la cookie, no la sesión.
 */
export const PROTECTED_PATH_PREFIXES = [
  "/inicio",
  "/clases",
  "/estudios",
  "/cursos",
  "/entrenador",
  "/profesor",
  "/administracion",
] as const;
