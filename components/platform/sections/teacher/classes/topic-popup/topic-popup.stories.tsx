import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { popupFormDone } from "@/services/shared/form-state";
import { TopicButton } from "./topic-popup.comp";

const meta = {
  title: "platform/sections/teacher/classes/TopicPopup",
  component: TopicButton,
  parameters: {
    docs: {
      description: {
        component: `
«Editar el tema»: the title the students see and the description, from the
pen beside the class's title. The action comes as a prop; the story passes
a stub.

Source: \`components/platform/sections/teacher/classes/topic-popup/topic-popup.comp.tsx\`.
Reference page: [Components › TopicPopup](/components/platform/sections/teacher/classes/topic-popup) in the docs site.
`,
      },
    },
  },
  args: {
    classId: "c2",
    topic: "Repaso de la Najdorf: tus dudas",
    description: "Sesión de preguntas sobre el capítulo 2 del curso de la Siciliana.",
    updateClassTopic: async () => popupFormDone("topicSaved"),
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ padding: 16 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TopicButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Open on the class's topic. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Editar el tema" }));
  },
};
