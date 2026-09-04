-- Ventanas del límite de frecuencia, fuera de la memoria del proceso.
--
-- El contador vivía en un Map de Node, así que el techo era por instancia: con
-- la app en varios procesos, un atacante multiplica sus intentos de login por
-- el número de instancias, y en serverless cada arranque en frío se los
-- devuelve a cero. En una tabla, el techo es uno solo para toda la app.
--
-- Sin `id` propio: la clave es la de negocio (`login:<email>`, `<userId>:<op>`)
-- y una fila por clave es exactamente lo que hace falta para contar.
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- Para el barrido de ventanas vencidas, que se hace de vez en cuando desde la
-- propia aplicación en lugar de con una tarea programada.
CREATE INDEX "RateLimit_resetAt_idx" ON "RateLimit"("resetAt");
