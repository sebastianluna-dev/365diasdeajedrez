-- A course has a second image: the square one.
--
-- The cover is 21:9 and is what its information page and the catalog show. The
-- row of «Mis cursos» shows it square, so the staff uploads a 1:1 image of its
-- own instead of having the wide one cropped for it.
--
-- Nullable and with no default: a course without a square image falls back to
-- its cover, cropped by Cloudinary, so nothing is missing while they are
-- uploaded one by one.

ALTER TABLE "Course" ADD COLUMN "thumbnail" TEXT;
