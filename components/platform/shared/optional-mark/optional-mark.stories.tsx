import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OptionalMark } from "./optional-mark.comp";

const meta = {
  title: "platform/shared/OptionalMark",
  component: OptionalMark,
  parameters: {
    docs: {
      description: {
        component: `
«Opcional» in a thin pill, right after a field's label: a line of the strong
border around the word in the label's grey, a step under it. The field pieces
draw it themselves — \`PlatformFormField\` and \`FormField\` when their
control has no \`required\`, \`PlatformFormGroup\` and \`FormFieldset\`
when told \`optional\` —, so no screen writes it, and \`OptionalFields\`
hides it under a single note when all the fields are optional. It is only for
the eye (\`aria-hidden\`): a required control is announced as such.

Source: \`components/platform/shared/optional-mark/optional-mark.comp.tsx\`.
Reference page: [Components › OptionalMark](/components/platform/shared/optional-mark) in the docs site.
`,
      },
    },
  },
} satisfies Meta<typeof OptionalMark>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The pill alone, as a field draws it after its label. */
export const Default: Story = {};
