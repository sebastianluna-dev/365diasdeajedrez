import type { CollectionConfig } from "payload";
import {
  BlockquoteFeature,
  BlocksFeature,
  BoldFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
  UploadFeature,
} from "@payloadcms/richtext-lexical";
import { ImageBlock } from "@/blocks/image-block";
import { CalloutBlock } from "@/blocks/callout-block";
import { ChessDiagramBlock } from "@/blocks/chess-diagram-block";
import { ChessGameBlock } from "@/blocks/chess-game-block";
import { isAdminOrEditor, isPublishedOrLoggedIn } from "@/lib/payload/access";
import { slugField } from "@/lib/payload/slug-field";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "_status", "publishedAt"],
    group: "Blog",
  },
  versions: {
    drafts: true,
  },
  access: {
    read: isPublishedOrLoggedIn,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data._status === "published" && !data.publishedAt) {
          data.publishedAt = new Date().toISOString();
        }
        return data;
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Contenido",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
            },
            slugField("title"),
            {
              name: "excerpt",
              type: "textarea",
              required: true,
            },
            {
              name: "featuredImage",
              type: "upload",
              relationTo: "media",
              required: true,
            },
            {
              name: "readTimeMinutes",
              type: "number",
              label: "Minutos de lectura",
              admin: {
                description: "Tiempo estimado de lectura, en minutos. Si se deja vacío, no se muestra.",
                width: "50%",
              },
            },
            {
              name: "content",
              type: "richText",
              required: true,
              editor: lexicalEditor({
                features: [
                  ParagraphFeature(),
                  HeadingFeature({ enabledHeadingSizes: ["h2", "h3"] }),
                  BoldFeature(),
                  ItalicFeature(),
                  OrderedListFeature(),
                  UnorderedListFeature(),
                  LinkFeature(),
                  BlockquoteFeature(),
                  UploadFeature(),
                  HorizontalRuleFeature(),
                  BlocksFeature({
                    blocks: [ImageBlock, CalloutBlock, ChessDiagramBlock, ChessGameBlock],
                  }),
                ],
              }),
            },
          ],
        },
        {
          label: "Organización",
          fields: [
            {
              name: "author",
              type: "relationship",
              relationTo: "users",
            },
            {
              name: "categories",
              type: "relationship",
              relationTo: "categories",
              hasMany: true,
            },
            {
              name: "tags",
              type: "relationship",
              relationTo: "tags",
              hasMany: true,
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "seo",
              type: "group",
              fields: [
                {
                  name: "metaTitle",
                  type: "text",
                  admin: {
                    description: "Si se deja vacío, se usa el título del artículo.",
                  },
                },
                {
                  name: "metaDescription",
                  type: "textarea",
                  admin: {
                    description: "Si se deja vacío, se usa el excerpt del artículo.",
                  },
                },
                {
                  name: "ogImage",
                  type: "upload",
                  relationTo: "media",
                  admin: {
                    description: "Si se deja vacío, se usa la imagen destacada.",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
      },
    },
  ],
};
