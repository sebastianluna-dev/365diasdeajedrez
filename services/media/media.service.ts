import { platformPublicId } from "@/lib/cloudinary-url";
import { getPlatformDb } from "@/lib/platform-db/get-platform-db";

/**
 * Whether one of the stored URLs is the asset `publicId` names. Compared by
 * id, not by text: a reframed cover is another URL of the same file, and an id
 * that merely starts with this one is another file.
 */
export function pointsAt(storedUrls: (string | null)[], publicId: string): boolean {
  return storedUrls.some((stored) => stored !== null && platformPublicId(stored) === publicId);
}

/**
 * Whether any column of the platform points at the image of `url`: an
 * author's or a teacher's photo, a course's cover or its square image. An
 * image that is not the platform's (another host, the site's media) counts as
 * in use, so nobody ever asks to delete it.
 */
export async function isPlatformImageInUse(url: string): Promise<boolean> {
  const publicId = platformPublicId(url);
  if (!publicId) return true;

  const db = getPlatformDb();
  // `contains` narrows on the database; `pointsAt` decides.
  const [authors, teachers, courses] = await Promise.all([
    db.author.findMany({ where: { photo: { contains: publicId } }, select: { photo: true } }),
    db.teacher.findMany({ where: { photo: { contains: publicId } }, select: { photo: true } }),
    db.course.findMany({
      where: { OR: [{ cover: { contains: publicId } }, { thumbnail: { contains: publicId } }] },
      select: { cover: true, thumbnail: true },
    }),
  ]);

  return pointsAt(
    [
      ...authors.map((author) => author.photo),
      ...teachers.map((teacher) => teacher.photo),
      ...courses.flatMap((course) => [course.cover, course.thumbnail]),
    ],
    publicId,
  );
}
