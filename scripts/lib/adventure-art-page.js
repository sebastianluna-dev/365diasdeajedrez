// Runs INSIDE the version-2 mockup of an adventure (loaded by
// scripts/adventure-art.ts through Playwright), where the mockup's own
// globals exist: the world's layouts (`ESCENARIO`), the helpers that draw its
// ground and cut-outs (`suelo`, `objetos`, `margen`, `smoothSegments`...), the
// rivals' engraved portraits (`retratoSVG`), the keepsakes (`RECUERDOS`) and
// the token and the needle. It exposes `window.__adventureArt` with what the
// script writes to disk; nothing here touches the page's own screens.
//
// The LIVE part of the map is not exported: the seam, the needle, the
// stamps, the pages, the keepsakes stuck down, the pencil notes and the token
// are drawn by the app from data (components/adventure/map). What the scenery
// keeps of the path is the paper tape alone, in the colour of the stretch that
// is still to walk.

(() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  const parse = (markup) =>
    new DOMParser().parseFromString(
      `<svg xmlns="${SVG_NS}" xmlns:xlink="http://www.w3.org/1999/xlink">${markup}</svg>`,
      "image/svg+xml",
    ).documentElement;

  const refsOf = (element) => {
    const found = new Set();
    const scan = (node) => {
      for (const attribute of Array.from(node.attributes || [])) {
        const value = attribute.value;
        if ((attribute.name === "href" || attribute.name === "xlink:href") && value.startsWith("#"))
          found.add(value.slice(1));
        for (const match of value.matchAll(/url\(\s*['"]?#([^)'"\s]+)/g)) found.add(match[1]);
      }
      for (const child of Array.from(node.children || [])) scan(child);
    };
    scan(element);
    return found;
  };

  /** Drops what <defs> holds that nothing reaches, from the document's own drawing outward. */
  const pruneDefs = (svg) => {
    const defs = Array.from(svg.children).filter((child) => child.localName === "defs");
    const byId = new Map();
    for (const group of defs)
      for (const child of Array.from(group.children))
        if (child.getAttribute("id")) byId.set(child.getAttribute("id"), child);
    const used = new Set();
    const queue = [];
    const reach = (ids) => {
      for (const id of ids)
        if (!used.has(id) && byId.has(id)) {
          used.add(id);
          queue.push(byId.get(id));
        }
    };
    for (const child of Array.from(svg.children)) if (child.localName !== "defs") reach(refsOf(child));
    while (queue.length) reach(refsOf(queue.pop()));
    for (const [id, element] of byId) if (!used.has(id)) element.remove();
    return svg;
  };

  const serialize = (svg) => new XMLSerializer().serializeToString(svg).replace(/ xmlns:xlink="[^"]*"/g, "");

  const framed = (box, body, extra = "") =>
    `<svg xmlns="${SVG_NS}" viewBox="${box.join(" ")}" width="${box[2]}" height="${box[3]}"${extra}>${body}</svg>`;

  const definitions = () => `<defs>${buildDefs("__INI__")}${buildDefsV2()}</defs>`;

  /** The paper tape of the path, with no seam: the whole of it as if it were still to be walked. */
  const bareTape = (L) => {
    const segments = smoothSegments(
      L.camino.map((p) => [p[0], p[1]]),
      L.tension || 1,
    );
    const all = segsToPath(segments);
    const tape = L.cinta || 30;
    return `<g filter="url(#f-cinta)">${S(all, "#b89a6e", tape + 3, 'stroke-linecap="butt"')}${S(all, "#f3ecdc", tape, 'stroke-linecap="butt"')}${S(all, "#8d877c", tape, `stroke-dasharray="1.2 ${(L.casilla || 26) - 1.2}" stroke-dashoffset="0.6" stroke-linecap="butt" opacity=".5"`)}</g>`;
  };

  const worldBox = (L) => [-BLEED, -40, L.ancho + BLEED * 2, L.alto + 40];

  /** One world's scenery: the paper, the ground, the cut-outs behind and before the path, and the tape. */
  const scene = (key) => {
    const L = ESCENARIO[key];
    const paper = `<rect x="${-BLEED}" y="-40" width="${L.ancho + BLEED * 2}" height="${L.alto + 80}" fill="#efe5cf"/><rect x="${-BLEED}" y="-40" width="${L.ancho + BLEED * 2}" height="${L.alto + 80}" fill="url(#tx-puntos)"/>`;
    const body = paper + suelo(L) + objetos(L, "fondo") + bareTape(L) + objetos(L, "medio") + margen(L);
    const box = worldBox(L);
    return serialize(pruneDefs(parse(framed(box, definitions() + body)).firstElementChild));
  };

  /** A miniature's scenery: the ground and the cut-outs, with no path (the cover draws it). */
  const miniature = (key) => {
    const L = ESCENARIO[key];
    const [x, y, w, h] = L.vb;
    const paper = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#efe5cf"/>`;
    const body = paper + suelo({ ...L, ancho: L.ancho }) + objetos(L, "fondo") + objetos(L, "medio");
    return serialize(pruneDefs(parse(framed(L.vb, definitions() + body)).firstElementChild));
  };

  // -- SVG to JSX -----------------------------------------------------------

  const CSS_PROPERTY = (name) => (name.startsWith("--") ? name : name.replace(/-([a-z])/g, (_, c) => c.toUpperCase()));
  const ATTRIBUTE = (name) => {
    if (name === "class") return "className";
    if (name === "xlink:href") return "href";
    if (name === "xml:space") return "xmlSpace";
    if (name.startsWith("data-") || name.startsWith("aria-")) return name;
    return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  };

  /** A string value as a JSX expression: `__ID__` becomes the component's `id`, `__INI__` its initials and `__NAME__` its name. */
  const literal = (value) => {
    if (!/__(ID|INI|NAME)__/.test(value)) return null;
    return (
      "{`" +
      value
        .replace(/`/g, "\\`")
        .replace(/\$\{/g, "\\${")
        .replaceAll("__ID__", "${id}")
        .replaceAll("__INI__", "${initials}")
        .replaceAll("__NAME__", "${name}") +
      "`}"
    );
  };

  const attributeJsx = (attribute) => {
    const name = ATTRIBUTE(attribute.name);
    if (attribute.name === "style") {
      const entries = attribute.value
        .split(";")
        .map((rule) => rule.trim())
        .filter(Boolean)
        .map((rule) => {
          const at = rule.indexOf(":");
          return [CSS_PROPERTY(rule.slice(0, at).trim()), rule.slice(at + 1).trim()];
        });
      return `style={{${entries.map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`).join(", ")}}}`;
    }
    const template = literal(attribute.value);
    if (template) return `${name}=${template}`;
    return `${name}=${JSON.stringify(attribute.value)}`;
  };

  const nodeJsx = (node) => {
    if (node.nodeType === 3) {
      const text = node.textContent;
      if (!text.trim()) return "";
      const template = literal(text);
      if (template) return template;
      return /[{}<>&]/.test(text) ? `{${JSON.stringify(text)}}` : text;
    }
    if (node.nodeType !== 1) return "";
    const tag = node.localName;
    const attributes = Array.from(node.attributes)
      .filter((attribute) => !attribute.name.startsWith("xmlns"))
      .map(attributeJsx)
      .join(" ");
    const children = Array.from(node.childNodes).map(nodeJsx).join("");
    const open = attributes ? `${tag} ${attributes}` : tag;
    return children ? `<${open}>${children}</${tag}>` : `<${open} />`;
  };

  /** The children of a markup fragment, as JSX. */
  const jsx = (markup) => Array.from(parse(markup).childNodes).map(nodeJsx).join("");

  /** The global patterns and filters a fragment reaches, copied in with ids of their own so it stands alone. */
  const withOwnDefs = (markup) => {
    const svg = parse(markup);
    const shared = parse(definitions());
    const byId = new Map();
    for (const child of Array.from(shared.children[0].children))
      if (child.getAttribute("id")) byId.set(child.getAttribute("id"), child);
    const local = new Set(Array.from(svg.querySelectorAll("[id]")).map((element) => element.getAttribute("id")));
    const needed = [...refsOf(svg)].filter((id) => !local.has(id) && byId.has(id));
    if (!needed.length) return markup;
    let out = markup;
    let defs = "";
    for (const id of needed) {
      const copy = byId.get(id).cloneNode(true);
      copy.setAttribute("id", `__ID__-${id}`);
      defs += new XMLSerializer().serializeToString(copy);
      out = out.replaceAll(`url(#${id})`, `url(#__ID__-${id})`);
    }
    return `<defs>${defs.replace(/ xmlns="[^"]*"/g, "")}</defs>${out}`;
  };

  window.__adventureArt = {
    layouts: () =>
      Object.fromEntries(
        ["escritorio", "tableta", "movil"].map((key) => [
          key,
          { width: ESCENARIO[key].ancho, height: ESCENARIO[key].alto },
        ]),
      ),
    scene,
    miniature,
    miniatureBoxes: () => ({ alta: ESCENARIO.miniatura.vb, ancha: ESCENARIO.miniaturaAncha.vb }),
    rivals: () => window.CUADERNO.rivales.map((rival) => ({ id: rival.id, order: rival.numero })),
    portrait: (index) => jsx(withOwnDefs(retratoSVG(window.CUADERNO.rivales[index], "__ID__"))),
    keepsakes: () => Object.keys(RECUERDOS).map(Number),
    keepsake: (order) => ({ viewBox: RECUERDOS[order].vb, jsx: jsx(withOwnDefs(RECUERDOS[order].svg())) }),
    envelope: () => {
      const markup = sobreSVG();
      return {
        viewBox: markup.match(/viewBox="([^"]+)"/)[1],
        jsx: jsx(markup.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")),
      };
    },
    token: () =>
      jsx(
        sFicha("__INI__")
          .replace(/^<g id="o-ficha">/, "")
          .replace(/<\/g>$/, ""),
      ),
    needle: () =>
      jsx(
        sAguja()
          .replace(/^<g id="o-aguja">/, "")
          .replace(/<\/g>$/, ""),
      ),
    marks: () => ({ pawn: pawnPath(), knight: knightPath().d, star: starPath(6.4, 2.7) }),
  };
})();
