import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { LOGIN_PATH, PROTECTED_PATH_PREFIXES } from "@/constants/platform/auth.const";
import {
  ADMIN_PATH_PREFIX,
  NONCE_PATH_PREFIXES,
  contentSecurityPolicy,
  sitePolicySource,
  type PolicyTarget,
} from "./content-security-policy";

/** The sources of one directive of a policy, or undefined when it is not there. */
function directive(policy: string, name: string): string[] | undefined {
  const found = policy.split("; ").find((part) => part.split(" ")[0] === name);
  return found?.split(" ").slice(1);
}

const NONCE = "bm9uY2UtZGUtcHJ1ZWJh";
const policyOf = (target: PolicyTarget, isDev = false) =>
  contentSecurityPolicy({ target, nonce: target === "platform" ? NONCE : undefined, isDev });
const TARGETS: PolicyTarget[] = ["platform", "site", "admin"];

/** The origin of every `https://` URL a source file writes, so a host the code calls is checked against the policy. */
function originsIn(path: string): string[] {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  return [...source.matchAll(/https:\/\/[a-z0-9.-]+/g)].map(([url]) => url);
}

describe("contentSecurityPolicy", () => {
  it("la plataforma sólo ejecuta lo que lleva su nonce y lo que eso carga", () => {
    const scripts = directive(policyOf("platform"), "script-src");
    expect(scripts).toEqual(expect.arrayContaining([`'nonce-${NONCE}'`, "'strict-dynamic'"]));
    expect(scripts).not.toContain("'unsafe-inline'");
    expect(scripts).not.toContain("'unsafe-eval'");
  });

  it("la plataforma no carga analítica ni píxeles", () => {
    const policy = policyOf("platform");
    expect(policy).not.toContain("google");
    expect(policy).not.toContain("facebook");
  });

  it("el sitio y el panel no llevan nonce: sus páginas son estáticas", () => {
    for (const target of ["site", "admin"] as const) {
      expect(policyOf(target)).not.toContain("'nonce-");
      expect(directive(policyOf(target), "script-src")).toContain("'unsafe-inline'");
      expect(() => contentSecurityPolicy({ target, nonce: NONCE, isDev: false })).toThrow(/no nonce/);
    }
    expect(() => contentSecurityPolicy({ target: "platform", isDev: false })).toThrow(/nonce/);
  });

  it("deja al sitio cargar Google Analytics y el píxel de Meta, y mandar sus datos", () => {
    const policy = policyOf("site");
    for (const path of [
      "components/site/shared/google-analytics.comp.tsx",
      "components/site/shared/meta-pixel.comp.tsx",
    ]) {
      for (const origin of originsIn(path)) {
        const allowed = [...directive(policy, "script-src")!, ...directive(policy, "img-src")!];
        expect(allowed, `${path} → ${origin}`).toContain(origin);
      }
    }
    expect(directive(policy, "connect-src")).toEqual(
      expect.arrayContaining(["https://*.google-analytics.com", "https://www.facebook.com"]),
    );
  });

  it("deja subir imágenes a Cloudinary y mostrarlas, en los tres", () => {
    const [upload] = originsIn("components/platform/shared/use-image-upload.hook.ts");
    expect(upload).toBe("https://api.cloudinary.com");
    for (const target of TARGETS) {
      expect(directive(policyOf(target), "connect-src")).toContain(upload);
      expect(directive(policyOf(target), "img-src")).toContain("https://res.cloudinary.com");
    }
  });

  it("deja al panel cargar el editor de código de su CDN, y a nadie más", () => {
    for (const name of ["script-src", "style-src", "font-src"]) {
      expect(directive(policyOf("admin"), name)).toContain("https://cdn.jsdelivr.net");
      expect(directive(policyOf("site"), name)).not.toContain("https://cdn.jsdelivr.net");
    }
  });

  it("en los tres: el motor compila WebAssembly, sus workers son propios, y nada enmarca ni redirige formularios", () => {
    for (const target of TARGETS) {
      const policy = policyOf(target);
      expect(directive(policy, "script-src")).toContain("'wasm-unsafe-eval'");
      expect(directive(policy, "worker-src")).toEqual(["'self'", "blob:"]);
      expect(directive(policy, "object-src")).toEqual(["'none'"]);
      expect(directive(policy, "frame-ancestors")).toEqual(["'none'"]);
      expect(directive(policy, "form-action")).toEqual(["'self'"]);
      expect(directive(policy, "base-uri")).toEqual(["'self'"]);
    }
  });

  it("en desarrollo permite eval, websockets locales y no fuerza https; en producción, al revés", () => {
    for (const target of TARGETS) {
      expect(directive(policyOf(target, true), "script-src")).toContain("'unsafe-eval'");
      expect(directive(policyOf(target, true), "connect-src")).toContain("ws://127.0.0.1:*");
      expect(policyOf(target)).not.toContain("ws://");
      expect(directive(policyOf(target, true), "upgrade-insecure-requests")).toBeUndefined();
      expect(directive(policyOf(target), "script-src")).not.toContain("'unsafe-eval'");
      expect(directive(policyOf(target), "upgrade-insecure-requests")).toEqual([]);
    }
  });
});

describe("sitePolicySource", () => {
  // Next compiles `source` with path-to-regexp; its custom group is a regular
  // expression over the path after the first slash.
  const site = new RegExp(`^${sitePolicySource()}$`);

  it("son los prefijos privados más el login", () => {
    expect(NONCE_PATH_PREFIXES).toEqual([...PROTECTED_PATH_PREFIXES, LOGIN_PATH]);
  });

  it("deja fuera la plataforma, su login y el panel, en la raíz y en sus hijos", () => {
    for (const prefix of [...NONCE_PATH_PREFIXES, ADMIN_PATH_PREFIX]) {
      expect(site.test(prefix), prefix).toBe(false);
      expect(site.test(`${prefix}/algo`), `${prefix}/algo`).toBe(false);
    }
  });

  it("cubre el resto, aunque empiece como un prefijo privado", () => {
    for (const path of ["/", "/blog", "/blog/un-articulo", "/entrar", "/engine/stockfish.js", "/cursos-de-ajedrez"]) {
      expect(site.test(path), path).toBe(true);
    }
  });
});
