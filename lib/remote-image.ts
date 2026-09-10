// Which remote images `next/image` may render.
//
// `next.config.ts` only allows res.cloudinary.com, and a URL from elsewhere
// does not degrade: `next/image` responds 400 and the whole page fails. A
// course's cover is typed by the staff by hand, so checking it before
// rendering is what separates "this row has no thumbnail" from "the course
// list does not load".

const ALLOWED_HOSTS = ["res.cloudinary.com"];

export function isDisplayableImage(url: string | undefined | null): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && ALLOWED_HOSTS.includes(parsed.hostname);
  } catch {
    // A relative path ("/portadas/x.jpg") is served by the app itself and is fine.
    return url.startsWith("/");
  }
}
