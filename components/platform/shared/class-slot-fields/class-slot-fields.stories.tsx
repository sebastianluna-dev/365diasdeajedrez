import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { userEvent, within } from "storybook/test";
import { PlatformForm } from "@/components/platform/shared/platform-form/platform-form.comp";
import {
  PlatformPopup,
  type PlatformPopupHandle,
} from "@/components/platform/shared/platform-popup/platform-popup.comp";
import { CLASSES_TIME_ZONE } from "@/lib/testing/fixtures/classes";
import { ClassSlotFields } from "./class-slot-fields.comp";

const meta = {
  title: "platform/shared/ClassSlotFields",
  component: ClassSlotFields,
  parameters: {
    docs: {
      description: {
        component: `
The three fields that date a class — the day, the hour and the duration —,
each in its own field, with the line that says the hours are the academy's
and the warnings the schedule rules gave, said and never blocking.

Source: \`components/platform/shared/class-slot-fields/class-slot-fields.comp.tsx\`.
Reference page: [Components › ClassSlotFields](/components/platform/shared/class-slot-fields) in the docs site.
`,
      },
    },
  },
  args: { namePrefix: "slot.0", timeZone: CLASSES_TIME_ZONE, warnings: [] },
  argTypes: {
    namePrefix: { control: "text" },
    defaultValue: { control: "object" },
    warnings: { control: "object" },
  },
  decorators: [
    (Story) => (
      <div className="platform-theme" style={{ maxWidth: 560 }}>
        <PlatformForm onSubmit={(event) => event.preventDefault()}>
          <Story />
        </PlatformForm>
      </div>
    ),
  ],
} satisfies Meta<typeof ClassSlotFields>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing chosen yet: the three placeholders. */
export const Empty: Story = {};

/** A class dated: mié 21 oct at 19:00 for an hour. */
export const Filled: Story = { args: { defaultValue: { date: "2026-10-21", time: "19:00", durationMin: 60 } } };

/** With what the schedule rules warned about: the teacher already has a class then. */
export const WithWarnings: Story = {
  name: "With warnings",
  args: {
    defaultValue: { date: "2026-11-04", time: "19:00", durationMin: 60 },
    warnings: ["GM Profesor Demo ya tiene «Plan de aperturas con blancas» a esa hora el mié 4 nov."],
  },
};

/** A duration the list does not offer (50 min): kept, so dating the class again does not change it. */
export const OddDuration: Story = {
  name: "Odd duration",
  args: { defaultValue: { date: "2026-10-21", time: "19:00", durationMin: 50 } },
};

/** Inside a popup, where the date picker and the selects stay within the dialog. */
export const InPopup: Story = {
  name: "In popup",
  decorators: [(Story) => <Story />],
  render: (args) => <InsidePopup {...args} />,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Programar" }));
  },
};

function InsidePopup(args: Parameters<typeof ClassSlotFields>[0]) {
  const popup = useRef<PlatformPopupHandle>(null);
  return (
    <div className="platform-theme">
      <button type="button" className="platform-button" onClick={(event) => popup.current?.open(event)}>
        Programar
      </button>
      <PlatformPopup ref={popup} title="Programar una clase" size="md">
        <PlatformForm onSubmit={(event) => event.preventDefault()} style={{ padding: 24 }}>
          <ClassSlotFields {...args} defaultValue={{ date: "2026-10-21", time: "12:00", durationMin: 60 }} />
        </PlatformForm>
      </PlatformPopup>
    </div>
  );
}
