import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Users } from "@/payload/collections/Users";
import { Categories } from "@/payload/collections/Categories";
import { Tags } from "@/payload/collections/Tags";
import { Media } from "@/payload/collections/Media";
import { Articles } from "@/payload/collections/Articles";
import { HomeHeader } from "@/payload/globals/HomeHeader";
import { HomeHero } from "@/payload/globals/HomeHero";
import { HomeProgram } from "@/payload/globals/HomeProgram";
import { HomeTeacher } from "@/payload/globals/HomeTeacher";
import { HomePackages } from "@/payload/globals/HomePackages";
import { HomeFaq } from "@/payload/globals/HomeFaq";
import { HomeMentors } from "@/payload/globals/HomeMentors";
import { HomeReviews } from "@/payload/globals/HomeReviews";
import { HomeCta } from "@/payload/globals/HomeCta";
import { SiteSettings } from "@/payload/globals/SiteSettings";
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
  // Without `sharp`, Payload does not read the dimensions of what is uploaded and
  // `Media.width`/`height` stay null forever: the site fell back to a fixed
  // 1536×2048 for the teacher's photo and any other ratio was distorted. It is
  // only used for the metadata: the transformations are done by Cloudinary.
  sharp,
  // Weight cap per file uploaded to the CMS. Editors have no reason to know how
  // to export light, and without this a 40 MB photo went in as it was.
  upload: {
    limits: { fileSize: 5 * 1024 * 1024 },
    abortOnLimit: true,
  },
  // Nobody consumes the GraphQL API (the site reads Payload with the local API)
  // and building its schema is part of every Payload start: in serverless, of
  // every cold start.
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
