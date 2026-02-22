import type { Meta, StoryObj } from "@storybook/react-vite";
import { MealPlanGenerator } from "./MealPlanGenerator";

const noop = () => {};

const meta = {
  title: "Meal Plans/MealPlanGenerator",
  component: MealPlanGenerator,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
  args: { onSuccess: noop, onCancel: noop },
} satisfies Meta<typeof MealPlanGenerator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
