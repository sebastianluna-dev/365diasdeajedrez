// The platform's theme: what the person chose, if they chose.
//
// The choice is a cookie and not a row of `User`: it is a property of the
// screen one is looking at, not of the account — the same person wants dark on
// the laptop at night and light on the tablet — and reading it in the layout
// costs nothing, while a query would cost one on every page.

/** The cookie that carries the choice. Absent = follow the machine. */
export const THEME_COOKIE_NAME = "tema";

export const THEMES = ["light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

/** The cookie's value, when it is one of the two. */
export function themeOf(raw: string | undefined): Theme | undefined {
  return THEMES.find((theme) => theme === raw);
}

/** A year: the choice is not a session's, it is the machine's. */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
