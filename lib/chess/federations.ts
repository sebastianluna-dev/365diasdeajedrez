// Federaciones de ajedrez: del código del PGN a su bandera.
//
// FIDE usa el código olímpico de tres letras, que NO es el ISO-3166 alfa-3 y
// difiere en unos cuantos países: CHI es Chile (no China, que es CHN), SUI es
// Suiza, GER Alemania, NED Países Bajos, LAT Letonia. Traducir a ciegas daría
// banderas equivocadas, así que la tabla es explícita.
//
// Está la mayoría de federaciones con actividad, no todas: lo que falte se
// queda sin bandera y enseña su código, que sigue siendo el dato de verdad.

const ISO_BY_FEDERATION: Record<string, string> = {
  ALG: "DZ", ARG: "AR", ARM: "AM", AUS: "AU", AUT: "AT", AZE: "AZ",
  BAN: "BD", BEL: "BE", BIH: "BA", BLR: "BY", BOL: "BO", BRA: "BR", BUL: "BG",
  CAN: "CA", CHI: "CL", CHN: "CN", COL: "CO", CRC: "CR", CRO: "HR", CUB: "CU", CYP: "CY", CZE: "CZ",
  DEN: "DK", DOM: "DO",
  ECU: "EC", EGY: "EG", ESA: "SV", ESP: "ES", EST: "EE", ETH: "ET",
  FIN: "FI", FRA: "FR",
  GEO: "GE", GER: "DE", GRE: "GR", GUA: "GT",
  HKG: "HK", HON: "HN", HUN: "HU",
  INA: "ID", IND: "IN", IRI: "IR", IRL: "IE", IRQ: "IQ", ISL: "IS", ISR: "IL", ITA: "IT",
  JPN: "JP",
  KAZ: "KZ", KEN: "KE", KGZ: "KG", KOR: "KR", KSA: "SA", KUW: "KW",
  LAT: "LV", LBN: "LB", LTU: "LT", LUX: "LU",
  MAR: "MA", MDA: "MD", MEX: "MX", MGL: "MN", MKD: "MK", MNE: "ME", MAS: "MY", MYA: "MM",
  NED: "NL", NGR: "NG", NOR: "NO", NZL: "NZ",
  PAN: "PA", PAR: "PY", PER: "PE", PHI: "PH", POL: "PL", POR: "PT", PUR: "PR",
  QAT: "QA",
  ROU: "RO", RSA: "ZA", RUS: "RU",
  SGP: "SG", SLO: "SI", SRB: "RS", SUI: "CH", SVK: "SK", SWE: "SE", SYR: "SY",
  THA: "TH", TUN: "TN", TUR: "TR",
  UAE: "AE", UKR: "UA", URU: "UY", USA: "US", UZB: "UZ",
  VEN: "VE", VIE: "VN",
  ZAM: "ZM", ZIM: "ZW",
};

/**
 * Bandera de una federación, o `null` si no está en la tabla.
 *
 * El emoji se compone con los dos indicadores regionales del código ISO: no hay
 * una lista de banderas que mantener, sólo la correspondencia de arriba.
 */
export function federationFlag(code: string | null | undefined): string | null {
  if (!code) return null;
  const iso = ISO_BY_FEDERATION[code.trim().toUpperCase()];
  if (!iso) return null;

  const REGIONAL_INDICATOR_A = 0x1f1e6;
  const LETTER_A = 65;
  return String.fromCodePoint(
    ...[...iso].map((letter) => REGIONAL_INDICATOR_A + letter.charCodeAt(0) - LETTER_A),
  );
}

/** Títulos FIDE que se aceptan; cualquier otra cosa se guarda tal cual. */
export const FIDE_TITLES = ["GM", "IM", "FM", "CM", "WGM", "WIM", "WFM", "WCM"] as const;
