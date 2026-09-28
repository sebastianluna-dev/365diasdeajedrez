// Rules of the authors that the client needs too (the «Autores» dialog and the
// course's card), so they are pure and import nothing from the server.

import { generateSlug, uniqueSlug } from "@/lib/generate-slug";

/**
 * What an author without a photo is drawn with: the first character of their
 * first two words, in capitals. "Equipo 365" → "E3", "María GM" → "MG",
 * "Kotov" → "K".
 */
export function authorInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => [...word][0] ?? "");
  return initials.join("").toLocaleUpperCase("es");
}

export type AuthorTone = "ink" | "soft";

/**
 * The tile the initials sit on. It comes from the name and from nothing else,
 * so an author has the same one in the list, in the form and in every course,
 * and a list of authors without photos is not a column of identical tiles.
 */
export function authorTone(name: string): AuthorTone {
  let sum = 0;
  for (const character of name.trim()) sum += character.codePointAt(0) ?? 0;
  return sum % 2 === 1 ? "ink" : "soft";
}

/**
 * The slug an author gets from their name: the name's, with a number behind
 * when another author already has it. Empty when the name yields none ("¡¿?!"),
 * which is a name the form refuses.
 *
 * `takenByOthers` are the slugs of every OTHER author: the one being edited
 * does not compete with itself.
 */
export function authorSlugFor(name: string, takenByOthers: Iterable<string>): string {
  const base = generateSlug(name);
  return base ? uniqueSlug(base, takenByOthers) : "";
}

/** Lower case and without accents, to compare what is typed with a name. */
function foldForSearch(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

/**
 * The authors a search suggests: the ones whose name contains what was typed,
 * ignoring case and accents, the ones that START with it first. Nothing typed,
 * nothing suggested.
 */
export function suggestAuthors<T extends { name: string }>(authors: T[], query: string, limit = 5): T[] {
  const wanted = foldForSearch(query);
  if (!wanted) return [];
  const matches = authors
    .map((author) => ({ author, at: foldForSearch(author.name).indexOf(wanted) }))
    .filter((match) => match.at >= 0);
  // Stable: among equals, the order the authors came in, which is by name.
  matches.sort((left, right) => Number(left.at > 0) - Number(right.at > 0));
  return matches.slice(0, limit).map((match) => match.author);
}
