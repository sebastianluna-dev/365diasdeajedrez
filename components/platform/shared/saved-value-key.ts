// The key a form control is mounted under, taken from the value it opens with.
//
// WHY A CONTROL NEEDS ONE. React resets a `<form action={…}>` once its action
// finishes, and Radix's form primitives — Checkbox, RadioGroup, Select — answer
// the form's `reset` event by going back to the value they had WHEN THEY WERE
// MOUNTED. On a form that stays on screen after saving, that is the value from
// before the save: the control showed what had just been replaced, the page
// had to be reloaded to see what was stored, and saving again without
// reloading sent the old value and undid the change.
//
// The primitive keeps that value in a ref nothing can reach, so the way to
// give it a new one is to mount it again. Keyed by what it opens with, a
// control whose saved value changed is mounted anew with that value as the one
// it goes back to; one whose value did not change is left alone, and a reset
// takes it to the value it already shows.
//
// It only matters to a control that holds its own value (`defaultValue`). One
// whose parent holds it (`value`) has nothing to go back to here: the key
// stays the same whatever the parent does.

/** Separates the values of a set; no code nor slug of the platform contains it. */
const SEPARATOR = "\u0001";

/**
 * The same set gives the same key whatever order it arrives in: the server
 * sends it in catalog order, and a remount because of the order alone would
 * throw away what is being chosen for nothing.
 */
export function savedValueKey(defaultValue: string | readonly string[] | undefined): string {
  if (defaultValue === undefined) return "";
  if (typeof defaultValue === "string") return defaultValue;
  return [...defaultValue].sort().join(SEPARATOR);
}
