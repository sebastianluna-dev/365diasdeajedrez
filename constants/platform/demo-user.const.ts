// Correos de las cuentas de prueba que crea el seed. Ya no son «la sesión»:
// desde que existe login real (lib/platform-auth/), son cuentas normales con su
// contraseña, y sirven para probar la plataforma sin dar de alta a nadie.
// Compartido aquí (sin server-only) para que el seed también pueda importarlo.
export const DEMO_USER_EMAIL = "alumno.demo@365diasdeajedrez.com";
export const DEMO_TEACHER_EMAIL = "profesor.demo@365diasdeajedrez.com";
