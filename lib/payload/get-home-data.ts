import { getPayload } from "@/lib/payload/get-payload";

export async function getHomeData() {
  const payload = await getPayload();

  const [hero, program, teacher, packages, faq] = await Promise.all([
    payload.findGlobal({ slug: "home-hero" }),
    payload.findGlobal({ slug: "home-program" }),
    payload.findGlobal({ slug: "home-teacher" }),
    payload.findGlobal({ slug: "home-packages" }),
    payload.findGlobal({ slug: "home-faq" }),
  ]);

  return { hero, program, teacher, packages, faq };
}
