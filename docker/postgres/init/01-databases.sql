-- Postgres runs this once, the first time the volume is empty: the image
-- creates POSTGRES_DB by itself and everything else is up to us.
--
-- `plataforma` already exists (POSTGRES_DB); this is the CMS's, which in
-- production is a separate managed database and here is a second database of
-- the same server. They share no tables, so nothing is lost by it.
CREATE DATABASE payload OWNER ajedrez;

COMMENT ON DATABASE plataforma IS 'PLATFORM_DATABASE_URL: courses, studies, classes, progress (Prisma).';
COMMENT ON DATABASE payload IS 'DATABASE_URI: the public site''s CMS (Payload, tables pushed by Drizzle).';
