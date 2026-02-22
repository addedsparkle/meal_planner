import type { Meta, StoryObj } from "@storybook/react-vite";
import { Trash2, Plus, Wand2 } from "lucide-react";
import { Button } from "./Button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary", "danger", "ghost"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: "Save Recipe", variant: "primary" },
};

export const Secondary: Story = {
  args: { children: "Cancel", variant: "secondary" },
};

export const Danger: Story = {
  args: { children: "Delete", variant: "danger" },
};

export const Ghost: Story = {
  args: { children: "View", variant: "ghost" },
};

export const Small: Story = {
  args: { children: "Edit", size: "sm", variant: "secondary" },
};

export const Large: Story = {
  args: { children: "Generate Plan", size: "lg" },
};

export const Loading: Story = {
  args: { children: "Saving…", loading: true },
};

export const Disabled: Story = {
  args: { children: "Submit", disabled: true },
};

export const WithIcon: Story = {
  args: { children: <><Wand2 className="h-4 w-4" /> Generate Plan</> },
};

export const DangerWithIcon: Story = {
  args: { children: <><Trash2 className="h-3.5 w-3.5" /> Delete</>, variant: "danger", size: "sm" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="primary"><Plus className="h-4 w-4" /> Create</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger"><Trash2 className="h-4 w-4" /> Delete</Button>
      <Button variant="ghost">View</Button>
    </div>
  ),
};
