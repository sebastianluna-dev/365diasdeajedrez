import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Users } from "@/collections/Users";
import { Categories } from "@/collections/Categories";
import { Tags } from "@/collections/Tags";
import { Media } from "@/collections/Media";
import { Articles } from "@/collections/Articles";
import { HomeHeader } from "@/globals/HomeHeader";
import { HomeHero } from "@/globals/HomeHero";
import { HomeProgram } from "@/globals/HomeProgram";
import { HomeTeacher } from "@/globals/HomeTeacher";
import { HomePackages } from "@/globals/HomePackages";
import { HomeFaq } from "@/globals/HomeFaq";
import { HomeMentors } from "@/globals/HomeMentors";
import { HomeReviews } from "@/globals/HomeReviews";
import { HomeCta } from "@/globals/HomeCta";
import { SiteSettings } from "@/globals/SiteSettings";
import { cloudinaryStorage } from "@/lib/payload/cloudinary-adapter";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? "",
  admin: {
    user: Users.slug,
  },
  collections: [Users, Categories, Tags, Media, Articles],
  globals: [
    HomeHeader,
    HomeHero,
    HomeProgram,
    HomeTeacher,
    HomePackages,
    HomeFaq,
    HomeMentors,
    HomeReviews,
    HomeCta,
    SiteSettings,
  ],
  editor: lexicalEditor(),
  // Sin `sharp`, Payload no lee las dimensiones de lo que se sube y
  // `Media.width`/`height` quedan a null para siempre: el sitio caía a un
  // respaldo fijo (1536×2048) para la foto del maestro y cualquier otra
  // proporción se deformaba. Sólo se usa para los metadatos: las
  // transformaciones las hace Cloudinary.
  sharp,
  // Tope de peso por archivo subido al CMS. Los editores no tienen por qué
  // saber exportar ligero, y sin esto una foto de 40 MB entraba tal cual.
  upload: {
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
  },
  // Nadie consume la API GraphQL (el sitio lee Payload con la API local) y
  // construir su esquema es parte de cada arranque de Payload: en serverless,
  // de cada arranque en frío.
  graphQL: { disable: true },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
  plugins: [
    cloudinaryStorage({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
      apiKey: process.env.CLOUDINARY_API_KEY ?? "",
      apiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
      folder: "365-ajedrez",
      collections: {
        media: true,
      },
    }),
  ],
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
