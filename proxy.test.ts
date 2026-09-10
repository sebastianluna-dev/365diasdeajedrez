import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import {
  LOGIN_PATH,
  PROTECTED_PATH_PREFIXES,
  RETURN_TO_PARAM,
  SESSION_COOKIE_NAME,
  SESSION_ENTRY_PATH,
} from "@/constants/platform/auth.const";
import { config, proxy } from "./proxy";

function requestTo(path: string, { withCookie = false } = {}): NextRequest {
  const request = new NextRequest(`http://localhost${path}`);
  if (withCookie) request.cookies.set(SESSION_COOKIE_NAME, "token-de-prueba");
  return request;
}

function redirectTarget(response: Response): URL {
  const location = response.headers.get("location");
  expect(location, "esperaba una redirección").not.toBeNull();
  return new URL(location!);
}

describe("proxy", () => {
  it("deja pasar la portada sin cookie (es estática y no debe leerla)", () => {
    const response = proxy(requestTo("/"));
    expect(response.headers.get("location")).toBeNull();
  });

  it("manda a /entrar a quien llega a la portada con cookie", () => {
    const response = proxy(requestTo("/", { withCookie: true }));
    expect(response.status).toBe(307);
    expect(redirectTarget(response).pathname).toBe(SESSION_ENTRY_PATH);
  });

  it("no toca el resto de páginas públicas aunque haya cookie", () => {
    for (const path of ["/nosotros", "/blog", SESSION_ENTRY_PATH, LOGIN_PATH]) {
      expect(proxy(requestTo(path, { withCookie: true })).headers.get("location")).toBeNull();
    }
  });

  it("corta la zona privada sin cookie y guarda a dónde se iba", () => {
    const response = proxy(requestTo("/clases/abc?tab=2"));
    const target = redirectTarget(response);
    expect(target.pathname).toBe(LOGIN_PATH);
    expect(target.searchParams.get(RETURN_TO_PARAM)).toBe("/clases/abc?tab=2");
  });

  it("deja pasar la zona privada con cookie sin comprobarla (eso lo hace el DAL)", () => {
    expect(proxy(requestTo("/inicio", { withCookie: true })).headers.get("location")).toBeNull();
  });

  it("corta TODOS los prefijos privados sin cookie, en la raíz y en sus hijos", () => {
    for (const prefix of PROTECTED_PATH_PREFIXES) {
      for (const path of [prefix, `${prefix}/abc`]) {
        expect(redirectTarget(proxy(requestTo(path))).pathname, path).toBe(LOGIN_PATH);
      }
    }
  });

  // The matcher has to be literal (Next analyses it at build time), so the only
  // way for it not to drift from the constant is to check it here.
  it("el matcher cubre exactamente los prefijos privados más la portada", () => {
    const fromConstant = PROTECTED_PATH_PREFIXES.map((prefix) => `${prefix}/:path*`);
    expect([...config.matcher].sort()).toEqual(["/", ...fromConstant].sort());
  });
});
