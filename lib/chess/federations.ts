// Federaciones de ajedrez: del código del PGN a su bandera.
//
// FIDE usa el código olímpico de tres letras, que NO es el ISO-3166 alfa-3 y
// difiere en unos cuantos países: CHI es Chile (no China, que es CHN), SUI es
// Suiza, GER Alemania, NED Países Bajos, LAT Letonia. Traducir a ciegas daría
// banderas equivocadas, así que la tabla es explícita.
//
// Está la mayoría de federaciones con actividad, no todas: lo que falte se
// queda sin bandera y enseña su código, que sigue siendo el dato de verdad.

interface Federation {
  /** ISO-3166 alfa-2, del que se compone la bandera. */
  iso: string;
  /** Nombre en castellano, para poder elegir la federación por su país. */
  name: string;
}

const FEDERATIONS: Record<string, Federation> = {
  ALG: { iso: "DZ", name: "Argelia" },
  ARG: { iso: "AR", name: "Argentina" },
  ARM: { iso: "AM", name: "Armenia" },
  AUS: { iso: "AU", name: "Australia" },
  AUT: { iso: "AT", name: "Austria" },
  AZE: { iso: "AZ", name: "Azerbaiyán" },
  BAN: { iso: "BD", name: "Bangladés" },
  BEL: { iso: "BE", name: "Bélgica" },
  BIH: { iso: "BA", name: "Bosnia y Herzegovina" },
  BLR: { iso: "BY", name: "Bielorrusia" },
  BOL: { iso: "BO", name: "Bolivia" },
  BRA: { iso: "BR", name: "Brasil" },
  BUL: { iso: "BG", name: "Bulgaria" },
  CAN: { iso: "CA", name: "Canadá" },
  CHI: { iso: "CL", name: "Chile" },
  CHN: { iso: "CN", name: "China" },
  COL: { iso: "CO", name: "Colombia" },
  CRC: { iso: "CR", name: "Costa Rica" },
  CRO: { iso: "HR", name: "Croacia" },
  CUB: { iso: "CU", name: "Cuba" },
  CYP: { iso: "CY", name: "Chipre" },
  CZE: { iso: "CZ", name: "Chequia" },
  DEN: { iso: "DK", name: "Dinamarca" },
  DOM: { iso: "DO", name: "República Dominicana" },
  ECU: { iso: "EC", name: "Ecuador" },
  EGY: { iso: "EG", name: "Egipto" },
  ESA: { iso: "SV", name: "El Salvador" },
  ESP: { iso: "ES", name: "España" },
  EST: { iso: "EE", name: "Estonia" },
  ETH: { iso: "ET", name: "Etiopía" },
  FIN: { iso: "FI", name: "Finlandia" },
  FRA: { iso: "FR", name: "Francia" },
  GEO: { iso: "GE", name: "Georgia" },
  GER: { iso: "DE", name: "Alemania" },
  GRE: { iso: "GR", name: "Grecia" },
  GUA: { iso: "GT", name: "Guatemala" },
  HKG: { iso: "HK", name: "Hong Kong" },
  HON: { iso: "HN", name: "Honduras" },
  HUN: { iso: "HU", name: "Hungría" },
  INA: { iso: "ID", name: "Indonesia" },
  IND: { iso: "IN", name: "India" },
  IRI: { iso: "IR", name: "Irán" },
  IRL: { iso: "IE", name: "Irlanda" },
  IRQ: { iso: "IQ", name: "Irak" },
  ISL: { iso: "IS", name: "Islandia" },
  ISR: { iso: "IL", name: "Israel" },
  ITA: { iso: "IT", name: "Italia" },
  JPN: { iso: "JP", name: "Japón" },
  KAZ: { iso: "KZ", name: "Kazajistán" },
  KEN: { iso: "KE", name: "Kenia" },
  KGZ: { iso: "KG", name: "Kirguistán" },
  KOR: { iso: "KR", name: "Corea del Sur" },
  KSA: { iso: "SA", name: "Arabia Saudí" },
  KUW: { iso: "KW", name: "Kuwait" },
  LAT: { iso: "LV", name: "Letonia" },
  LBN: { iso: "LB", name: "Líbano" },
  LTU: { iso: "LT", name: "Lituania" },
  LUX: { iso: "LU", name: "Luxemburgo" },
  MAR: { iso: "MA", name: "Marruecos" },
  MAS: { iso: "MY", name: "Malasia" },
  MDA: { iso: "MD", name: "Moldavia" },
  MEX: { iso: "MX", name: "México" },
  MGL: { iso: "MN", name: "Mongolia" },
  MKD: { iso: "MK", name: "Macedonia del Norte" },
  MNE: { iso: "ME", name: "Montenegro" },
  MYA: { iso: "MM", name: "Myanmar" },
  NED: { iso: "NL", name: "Países Bajos" },
  NGR: { iso: "NG", name: "Nigeria" },
  NOR: { iso: "NO", name: "Noruega" },
  NZL: { iso: "NZ", name: "Nueva Zelanda" },
  PAN: { iso: "PA", name: "Panamá" },
  PAR: { iso: "PY", name: "Paraguay" },
  PER: { iso: "PE", name: "Perú" },
  PHI: { iso: "PH", name: "Filipinas" },
  POL: { iso: "PL", name: "Polonia" },
  POR: { iso: "PT", name: "Portugal" },
  PUR: { iso: "PR", name: "Puerto Rico" },
  QAT: { iso: "QA", name: "Catar" },
  ROU: { iso: "RO", name: "Rumanía" },
  RSA: { iso: "ZA", name: "Sudáfrica" },
  RUS: { iso: "RU", name: "Rusia" },
  SGP: { iso: "SG", name: "Singapur" },
  SLO: { iso: "SI", name: "Eslovenia" },
  SRB: { iso: "RS", name: "Serbia" },
  SUI: { iso: "CH", name: "Suiza" },
  SVK: { iso: "SK", name: "Eslovaquia" },
  SWE: { iso: "SE", name: "Suecia" },
  SYR: { iso: "SY", name: "Siria" },
  THA: { iso: "TH", name: "Tailandia" },
  TUN: { iso: "TN", name: "Túnez" },
  TUR: { iso: "TR", name: "Turquía" },
  UAE: { iso: "AE", name: "Emiratos Árabes Unidos" },
  UKR: { iso: "UA", name: "Ucrania" },
  URU: { iso: "UY", name: "Uruguay" },
  USA: { iso: "US", name: "Estados Unidos" },
  UZB: { iso: "UZ", name: "Uzbekistán" },
  VEN: { iso: "VE", name: "Venezuela" },
  VIE: { iso: "VN", name: "Vietnam" },
  ZAM: { iso: "ZM", name: "Zambia" },
  ZIM: { iso: "ZW", name: "Zimbabue" },
};

/**
 * Bandera de una federación, o `null` si no está en la tabla.
 *
 * El emoji se compone con los dos indicadores regionales del código ISO: no hay
 * una lista de banderas que mantener, sólo la correspondencia de arriba.
 */
export function federationFlag(code: string | null | undefined): string | null {
  if (!code) return null;
  const iso = FEDERATIONS[code.trim().toUpperCase()]?.iso;
  if (!iso) return null;

  const REGIONAL_INDICATOR_A = 0x1f1e6;
  const LETTER_A = 65;
  return String.fromCodePoint(
    ...[...iso].map((letter) => REGIONAL_INDICATOR_A + letter.charCodeAt(0) - LETTER_A),
  );
}

/** Títulos FIDE que se aceptan; cualquier otra cosa se guarda tal cual. */
export const FIDE_TITLES = ["GM", "IM", "FM", "CM", "WGM", "WIM", "WFM", "WCM"] as const;

/** Cómo se llama cada título, para poder elegirlo sin saberse las siglas. */
export const FIDE_TITLE_LABELS: Record<string, string> = {
  GM: "Gran Maestro",
  IM: "Maestro Internacional",
  FM: "Maestro FIDE",
  CM: "Maestro Candidato",
  WGM: "Gran Maestra",
  WIM: "Maestra Internacional",
  WFM: "Maestra FIDE",
  WCM: "Maestra Candidata",
};

/**
 * Nombre del país de una federación, o null si el código no está en la tabla.
 *
 * Los nombres van escritos aquí y NO salen de `Intl.DisplayNames`: los datos de
 * idioma de Node y los del navegador no son los mismos —«Hong Kong» en uno,
 * «RAE de Hong Kong (China)» en el otro—, y con la lista ordenada por nombre
 * eso cambiaba el orden de las opciones entre el servidor y el cliente,
 * rompiendo la hidratación. Además, así se elige cómo se llama cada país en el
 * producto en vez de heredarlo de la versión de ICU que toque.
 */
export function federationName(code: string | null | undefined): string | null {
  if (!code) return null;
  return FEDERATIONS[code.trim().toUpperCase()]?.name ?? null;
}

export interface FederationOption {
  code: string;
  label: string;
}

let cachedOptions: FederationOption[] | null = null;

/**
 * Clave de orden sin acentos ni mayúsculas.
 *
 * Se ordena con esto y no con `localeCompare`, que consulta los datos de
 * intercalación del entorno: como este listado se pinta en el servidor y se
 * hidrata en el navegador, el orden tiene que salir igual en los dos aunque
 * tengan versiones distintas de ICU.
 */
function sortKey(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

/**
 * Las federaciones para un desplegable, por orden alfabético del país.
 *
 * Se ordena por el NOMBRE y no por el código porque es lo que se lee: nadie
 * busca «NED» entre la N, busca «Países Bajos» entre las pes.
 */
export function federationOptions(): FederationOption[] {
  if (cachedOptions) return cachedOptions;

  cachedOptions = Object.keys(FEDERATIONS)
    .map((code) => ({ code, label: `${federationName(code) ?? code} (${code})`, key: "" }))
    .map((option) => ({ ...option, key: sortKey(option.label) }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0))
    .map(({ code, label }) => ({ code, label }));

  return cachedOptions;
}
