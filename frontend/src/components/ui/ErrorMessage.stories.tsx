import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorMessage } from "./ErrorMessage";

const meta = {
  title: "UI/ErrorMessage",
  component: ErrorMessage,
  tags: ["autodocs"],
} satisfies Meta<typeof ErrorMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithString: Story = {
  args: { error: "Something went wrong. Please try again." },
};

export const WithErrorObject: Story = {
  args: { error: new Error("Failed to save recipe: network error") },
};

export const LongError: Story = {
  args: {
    error: "No recipes available. Please add some recipes before generating a meal plan.",
  },
};
