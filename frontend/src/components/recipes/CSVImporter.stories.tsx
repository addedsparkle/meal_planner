import type { Meta, StoryObj } from "@storybook/react-vite";
import { CSVImporter } from "./CSVImporter";

const noop = () => {};

const meta = {
  title: "Recipes/CSVImporter",
  component: CSVImporter,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
  args: { onSuccess: noop, onCancel: noop },
} satisfies Meta<typeof CSVImporter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
