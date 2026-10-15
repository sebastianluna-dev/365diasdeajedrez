// Emails of the test accounts the seed creates. They are no longer "the
// session": since real login exists (lib/platform-auth/), they are ordinary
// accounts with their password, and serve to try the platform without
// enrolling anyone. Shared here (without server-only) so the seed can import it too.
export const DEMO_USER_EMAIL = "alumno.demo@365diasdeajedrez.com";
export const DEMO_TEACHER_EMAIL = "profesor.demo@365diasdeajedrez.com";
export const DEMO_STAFF_EMAIL = "staff.demo@365diasdeajedrez.com";

/**
 * The classmates of the classes demo (2026-10-15): five more students the seed
 * creates, with the same password, so the staff's agenda, a group class and
 * the payments have somebody in them.
 */
export const DEMO_CLASSMATE_EMAILS = {
  valentina: "valentina.demo@365diasdeajedrez.com",
  mateo: "mateo.demo@365diasdeajedrez.com",
  diego: "diego.demo@365diasdeajedrez.com",
  lucia: "lucia.demo@365diasdeajedrez.com",
  andrea: "andrea.demo@365diasdeajedrez.com",
} as const;
