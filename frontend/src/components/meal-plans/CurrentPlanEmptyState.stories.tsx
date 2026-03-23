import type { Meta, StoryObj } from "@storybook/react";
import { CurrentPlanEmptyState } from "./CurrentPlanEmptyState";

const meta: Meta<typeof CurrentPlanEmptyState> = {
  title: "Meal Plans/CurrentPlanEmptyState",
  component: CurrentPlanEmptyState,
};

export default meta;
type Story = StoryObj<typeof CurrentPlanEmptyState>;

export const Default: Story = {};
