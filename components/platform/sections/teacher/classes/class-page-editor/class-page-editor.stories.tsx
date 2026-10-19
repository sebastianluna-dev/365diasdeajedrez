import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { ClassPageEditor } from "./class-page-editor.comp";
import { EDITOR_SAMPLE_BLOCKS, EDITOR_SAMPLE_OPTIONS } from "./class-page-editor.sample";

const meta = {
  title: "platform/sections/teacher/classes/ClassPageEditor",
  component: ClassPageEditor,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
The teacher's class page as one page to write on, the way Notion works
(option A of the editor canvas, 2026-10-19). Typed in place: «/» opens the
menu of blocks, «# », «## », «- » and «> » turn a paragraph into a title, a
subtitle, a list or a quote, and each block's ⋮⋮ is dragged to move it and
opens its menu. Front-only: nothing is stored.

Source: \`components/platform/sections/teacher/classes/class-page-editor/class-page-editor.comp.tsx\`.
Reference page: [Components › ClassPageEditor](/components/platform/sections/teacher/classes/class-page-editor) in the docs site.
`,
      },
    },
  },
  args: {
    title: "La posición de Lucena",
    dateline: "Jueves 29 de octubre · 18:00",
    blocks: EDITOR_SAMPLE_BLOCKS,
    options: EDITOR_SAMPLE_OPTIONS,
    endHour: "19:00",
  },
  decorators: [
    (Story) => (
      <div className="platform-theme platform-page platform-page_width_full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ClassPageEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A class written in the editor: text, the teacher's script, a question, a diagram, a game, a lesson and, for after the class, a list and a series. */
export const Written: Story = {};

/** A new class: no title and no blocks, only the line where the first one is typed. */
export const Empty: Story = {
  args: { title: "", blocks: [] },
};

/** «/» typed in the last line: the menu of blocks, filtered by what follows the slash. */
export const SlashMenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("textbox", { name: "Agregar un bloque al final" }));
    await userEvent.keyboard("/");
    const search = await canvas.findByRole("combobox", { name: "Busca un tipo de bloque" });
    await userEvent.type(search, "dia");
    await expect(canvas.getByRole("option", { name: /Diagrama/ })).toBeVisible();
  },
};

/** A block moved down with the keyboard: Space on its ⋮⋮ picks it up, the arrow moves it, Space drops it. */
export const KeyboardMove: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [grip] = canvas.getAllByRole("button", { name: /^Opciones de «Título»/ });
    grip?.focus();
    // dnd-kit measures the rows between keys: each one waits for a frame or two, as a hand does.
    const pause = () => new Promise((resolve) => setTimeout(resolve, 250));
    await userEvent.keyboard(" ");
    await pause();
    await userEvent.keyboard("{ArrowDown}");
    await pause();
    await userEvent.keyboard(" ");
    await pause();
    const kinds = [...canvasElement.querySelectorAll(".class-page-editor__row")].map(
      (row) => /_kind_(\w+)/.exec(row.className)?.[1],
    );
    await expect(kinds.slice(2, 4)).toEqual(["text", "heading"]);
  },
};

/** The same class as the student reads it after the class: no script, no empty blocks, no controls. */
export const StudentView: Story = {
  args: { defaultMode: "student" },
};
