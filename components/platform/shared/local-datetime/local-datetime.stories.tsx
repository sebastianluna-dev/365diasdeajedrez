import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LocalDateTime } from "./local-datetime.comp";

const meta = {
  title: "platform/shared/LocalDateTime",
  component: LocalDateTime,
  parameters: {
    docs: {
      description: {
        component: `
An instant stored in UTC, written in the browser's time zone. The server does
not know the student's zone, so the HTML carries the text the server formatted
(\`fallback\`) and the browser replaces it once hydrated: a story is always
hydrated, so it shows the browser's text — in this machine's zone — unless the
instant cannot be read. It is a bare \`<time>\`: whoever mounts it styles it.

Source: \`components/platform/shared/local-datetime/local-datetime.comp.tsx\`.
Reference page: [Components › LocalDateTime](/components/platform/shared/local-datetime) in the docs site.
`,
      },
    },
  },
  args: {
    iso: "2026-10-06T23:00:00.000Z",
    fallback: "6 de octubre, 2026 · 23:00 h",
    withTime: true,
  },
  argTypes: {
    iso: { control: "text", description: "The instant in ISO (UTC), exactly as stored." },
    fallback: {
      control: "text",
      description:
        "The server's text (`formatSpanishDate` · `formatSpanishTime`, in its zone): what the HTML carries until hydration.",
    },
    withTime: { control: "boolean", description: "`false` writes the date alone." },
  },
} satisfies Meta<typeof LocalDateTime>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A class at 23:00 UTC: in Mexico City that is 17:00 of the same day, in Madrid 01:00 of the next one, so the
 * date itself depends on where it is read.
 */
export const WithTime: Story = { name: "With time" };

/** The date alone. */
export const DateOnly: Story = { name: "Date only", args: { withTime: false, fallback: "6 de octubre, 2026" } };

/** An instant the browser cannot read keeps the server's text: the date and time as the server, in UTC, wrote them. */
export const Unreadable: Story = { args: { iso: "no es una fecha" } };
