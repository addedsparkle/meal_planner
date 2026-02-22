import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: "Enter value…" },
};

export const WithLabel: Story = {
  args: { label: "Recipe Name", placeholder: "e.g. Spaghetti Bolognese" },
};

export const WithHint: Story = {
  args: {
    label: "Protein",
    placeholder: "e.g. chicken, beef, tofu",
    hint: "Used to balance variety across the week",
  },
};

export const WithError: Story = {
  args: {
    label: "Recipe Name",
    placeholder: "e.g. Spaghetti Bolognese",
    error: "Recipe name is required",
  },
};

export const WithValue: Story = {
  args: { label: "Recipe Name", defaultValue: "Chicken Stir Fry" },
};

export const DateInput: Story = {
  args: { label: "Start Date", type: "date" },
};

export const Disabled: Story = {
  args: { label: "Recipe Name", defaultValue: "Chicken Stir Fry", disabled: true },
};
