import type { JSX } from "react";

// The cover of a closed notebook, drawn with two inks: the colour of the cloth
// and one ink for the motif (some tints of it are the same ink at less
// strength). The six notebooks of the shelf are the states the owner
// listed: what each one will explore is its motif.

interface CoverArtProps {
  /** The notebook's address (`ComingAdventureSeed.slug`): it picks the motif. */
  slug: string;
}

/** Cloth and ink of each cover. An address that is not here gets plain brown cloth. */
const COVERS: Record<string, { cloth: string; ink: string }> = {
  veracruz: { cloth: "#1f4f7a", ink: "#f1e8d4" },
  chihuahua: { cloth: "#a8512c", ink: "#f1e8d4" },
  yucatan: { cloth: "#f1e8d4", ink: "#2c4a7a" },
  cdmx: { cloth: "#b03a6b", ink: "#f1e8d4" },
  puebla: { cloth: "#e9e4d6", ink: "#274c8c" },
  tlaxcala: { cloth: "#2f6b4a", ink: "#f1e8d4" },
};

type Inks = { cloth: string; ink: string };

/** A jarana and the sea's waves: Veracruz. */
function Veracruz({ cloth, ink }: Inks) {
  return (
    <>
      <g transform="rotate(18 66 110)">
        <rect x="63" y="50" width="6" height="42" fill={ink} />
        <rect x="60" y="42" width="12" height="12" rx="2" fill={ink} />
        <circle cx="66" cy="94" r="13" fill={ink} />
        <circle cx="66" cy="118" r="17" fill={ink} />
        <circle cx="66" cy="112" r="6" fill={cloth} />
        <path d="M64 96 V122 M68 96 V122" stroke={cloth} strokeWidth="1" />
      </g>
      <path
        d="M14 150 q8 -8 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 M14 160 q8 -8 16 0 t16 0 t16 0 t16 0 t16 0 t16 0"
        fill="none"
        stroke={ink}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.85"
      />
    </>
  );
}

/** The sun over the canyon walls: Chihuahua. */
function Chihuahua({ ink }: Inks) {
  return (
    <>
      <circle cx="92" cy="74" r="12" fill={ink} />
      <path d="M12 118 L34 96 L52 112 L72 92 L96 114 L120 100 V176 H12Z" fill={ink} opacity="0.4" />
      <path d="M12 134 L30 112 L50 130 L74 108 L98 132 L120 118 V176 H12Z" fill={ink} opacity="0.65" />
      <path d="M12 152 L32 134 L54 150 L76 130 L100 152 L120 140 V176 H12Z" fill={ink} />
    </>
  );
}

/** A cenote and the embroidery of a hipil: Yucatán. */
function Yucatan({ cloth, ink }: Inks) {
  return (
    <>
      <circle cx="66" cy="94" r="30" fill="none" stroke={ink} strokeWidth="2" />
      <circle cx="66" cy="94" r="21" fill={ink} opacity="0.35" />
      <circle cx="66" cy="94" r="12" fill={ink} />
      <path d="M36 94 Q50 62 66 62 Q82 62 96 94" fill="none" stroke={ink} strokeWidth="2" />
      <path d="M16 134 H116 M16 168 H116" stroke={ink} strokeWidth="1.4" strokeDasharray="3 3" />
      {[24, 42, 60, 78, 96].map((x) => (
        <g key={x} transform={`translate(${x} 151)`}>
          <circle cx="0" cy="-5" r="3.6" fill={ink} />
          <circle cx="0" cy="5" r="3.6" fill={ink} />
          <circle cx="-5" cy="0" r="3.6" fill={ink} />
          <circle cx="5" cy="0" r="3.6" fill={ink} />
          <circle cx="0" cy="0" r="2" fill={cloth} />
        </g>
      ))}
    </>
  );
}

/** The Angel on her column and a trajinera: Ciudad de México. */
function Cdmx({ cloth, ink }: Inks) {
  return (
    <>
      <rect x="61" y="78" width="10" height="52" fill={ink} />
      <rect x="55" y="124" width="22" height="8" fill={ink} />
      <rect x="58" y="72" width="16" height="8" fill={ink} />
      <circle cx="66" cy="60" r="5" fill={ink} />
      <path
        d="M62 66 C48 56 40 62 34 70 C46 68 54 72 62 76Z M70 66 C84 56 92 62 98 70 C86 68 78 72 70 76Z"
        fill={ink}
      />
      <path d="M22 148 H110 L100 164 H32Z" fill={ink} />
      <path d="M34 148 Q66 120 98 148" fill="none" stroke={ink} strokeWidth="3" />
      <path d="M44 148 Q66 130 88 148" fill={cloth} stroke={ink} strokeWidth="1.5" />
      <path d="M40 156 H92" stroke={cloth} strokeWidth="2" strokeDasharray="4 3" />
    </>
  );
}

/** Two volcanoes over a row of tiles: Puebla. */
function Puebla({ cloth, ink }: Inks) {
  return (
    <>
      <path d="M14 126 L50 62 L84 126Z" fill={ink} />
      <path d="M40 80 L50 62 L60 80 L54 76 L50 82 L46 76Z" fill={cloth} />
      <path d="M62 126 L92 82 L120 126Z" fill={ink} opacity="0.55" />
      {[18, 46, 74, 100].map((x) => (
        <g key={x} transform={`translate(${x} 140)`}>
          <rect width="26" height="26" fill="none" stroke={ink} strokeWidth="1.6" />
          <path d="M13 3 L23 13 L13 23 L3 13Z" fill="none" stroke={ink} strokeWidth="1.4" />
          <circle cx="13" cy="13" r="3" fill={ink} />
        </g>
      ))}
    </>
  );
}

/** A carpet of flowers: Tlaxcala. */
function Tlaxcala({ cloth, ink }: Inks) {
  return (
    <>
      <rect x="18" y="58" width="96" height="104" fill="none" stroke={ink} strokeWidth="1.6" strokeDasharray="2 4" />
      {[0, 45, 90, 135].map((angle) => (
        <ellipse
          key={angle}
          cx="66"
          cy="110"
          rx="9"
          ry="30"
          fill={ink}
          opacity="0.55"
          transform={`rotate(${angle} 66 110)`}
        />
      ))}
      {[0, 45, 90, 135].map((angle) => (
        <ellipse key={angle} cx="66" cy="110" rx="5" ry="21" fill={ink} transform={`rotate(${angle + 22.5} 66 110)`} />
      ))}
      <circle cx="66" cy="110" r="9" fill={cloth} />
      <circle cx="66" cy="110" r="4.5" fill={ink} />
      {[
        [26, 66],
        [106, 66],
        [26, 154],
        [106, 154],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3.4" fill={ink} />
      ))}
    </>
  );
}

const MOTIFS: Record<string, (inks: Inks) => JSX.Element> = {
  veracruz: Veracruz,
  chihuahua: Chihuahua,
  yucatan: Yucatan,
  cdmx: Cdmx,
  puebla: Puebla,
  tlaxcala: Tlaxcala,
};

/**
 * A closed notebook, seen from the front: cloth, its label, a motif of the
 * place and the elastic band. Decorative: the name is written under it.
 */
export function NotebookCoverArt({ slug }: CoverArtProps) {
  const inks = COVERS[slug] ?? { cloth: "#6e4630", ink: "#f1e8d4" };
  const Motif = MOTIFS[slug];
  return (
    <svg className="notebook-spine__art" viewBox="0 0 132 176" aria-hidden="true" focusable="false">
      <rect width="132" height="176" rx="4" fill={inks.cloth} />
      <rect width="10" height="176" fill="#000" opacity="0.16" />
      <rect x="22" y="14" width="88" height="34" rx="2" fill="#f1e8d4" />
      <path d="M32 26 H100 M32 36 H82" stroke={inks.cloth} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      {Motif && <Motif {...inks} />}
      <rect x="119" width="6" height="176" fill="#1d1a19" opacity="0.88" />
    </svg>
  );
}
