import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner, SpinnerOverlay } from "./Spinner";

const meta = {
  title: "UI/Spinner",
  component: Spinner,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: { size: "sm" },
};

export const Medium: Story = {
  args: { size: "md" },
};

export const Large: Story = {
  args: { size: "lg" },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </div>
  ),
};

export const Overlay: Story = {
  render: () => (
    <div className="relative h-40 w-80 rounded-lg border border-gray-200">
      <p className="p-4 text-sm text-gray-400">Content behind overlay</p>
      <SpinnerOverlay />
    </div>
  ),
};
