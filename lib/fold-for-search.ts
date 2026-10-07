/**
 * Lower case and without accents, to compare what is typed with what is
 * shown: «kasparov» finds «Kaspárov», «NAJDORF» finds «Najdorf». The same
 * fold on both sides is what makes a search forgiving; it is used by the
 * staff's author picker and by «Mis estudios».
 */
export function foldForSearch(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}
