import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthorAvatar } from "./author-avatar.comp";

/**
 * The repository holds no portrait (the authors' photos live on Cloudinary), so
 * a piece from public/pieces stands in for one: a local path is a picture the
 * avatar draws, as the app draws a Cloudinary URL.
 */
const PICTURE = "/pieces/w-knight.svg";

const SIZES = ["small", "medium", "large"] as const;
const SHAPES = ["tile", "circle"] as const;

const meta = {
  title: "platform/sections/staff/courses/authors-manager/AuthorAvatar",
  component: AuthorAvatar,
  parameters: {
    docs: {
      description: {
        component: `
An author's face: their photo, or the initials of their name on one of two
tiles, ink or soft, which the name picks, so the same author looks the same in
the «Autores» dialog, in the photo field and in a course's card. A photo the
app cannot draw (a host \`next/image\` does not allow) falls back to the
initials. It is decorative: the name is always written next to it.

Source: \`components/platform/sections/staff/courses/authors-manager/author-avatar.comp.tsx\`.
Reference page: [Components › AuthorsManager](/components/platform/sections/staff/courses/authors-manager) in the docs site.
`,
      },
    },
  },
  args: { name: "Tomás Herrera", size: "large", shape: "tile" },
  argTypes: {
    name: { control: "text", description: "The initials and the tone of the tile come from it." },
    photo: { control: "text", description: "Drawn when `isDisplayableImage` accepts it; the initials otherwise." },
    size: { control: "inline-radio", options: SIZES, description: "36, 46 (the default) or 56px." },
    shape: {
      control: "inline-radio",
      options: SHAPES,
      description: "A tile in the lists, a circle in a course's card.",
    },
  },
} satisfies Meta<typeof AuthorAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No photo: «TH» on the ink tile, large, as in a row of the «Autores» dialog. */
export const Initials: Story = {};

/** Another name picks the other tile: «FR» on the soft one. */
export const OtherTone: Story = { name: "Other tone", args: { name: "Fernanda Ríos" } };

/** With a photo, cropped to fill the tile; a piece stands in for the author's portrait. */
export const Photo: Story = { args: { name: "Mateo Vidal", photo: PICTURE } };

/** A photo from a host the app does not allow is not drawn: the initials, «MV», stand in for it. */
export const PhotoItCannotDraw: Story = {
  name: "Photo it cannot draw",
  args: { name: "Mateo Vidal", photo: "https://example.com/retrato.jpg" },
};

/** The three sizes in both shapes: small in the search's suggestions, medium and round in a course's card, large in the dialog. */
export const SizesAndShapes: Story = {
  name: "Sizes and shapes",
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--platform-space-4)" }}>
      {SHAPES.map((shape) => (
        <div key={shape} style={{ display: "flex", alignItems: "center", gap: "var(--platform-space-4)" }}>
          {SIZES.map((size) => (
            <AuthorAvatar key={size} {...args} size={size} shape={shape} />
          ))}
        </div>
      ))}
    </div>
  ),
};
