-- Objetivo diario de estudio, en minutos.
--
-- Con valor por defecto para que las cuentas que ya existen tengan uno sin
-- rellenar nada: treinta minutos es media hora de estudio, que es la medida en
-- la que la gente piensa su día.
--
-- La racha diaria NO se guarda: se deriva de UserActivity contando días
-- seguidos hacia atrás (ver lib/study-streak.ts). Guardarla obligaría a
-- mantenerla al día con una tarea nocturna y a repararla cuando se desfasara.
ALTER TABLE "User" ADD COLUMN "dailyGoalMinutes" INTEGER NOT NULL DEFAULT 30;
