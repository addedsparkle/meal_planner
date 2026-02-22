import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MealPlanList } from "./MealPlanList";
import type { MealPlan } from "../../lib/types";

function day(id: number, date: string, mealType: string, name: string, protein: string | null = null, freezable = false) {
  return { id, dayDate: date, mealType, recipe: { id, name, protein, freezable, description: null } };
}

const mockPlans: MealPlan[] = [
  {
    id: 1,
    name: "Week of 3 March",
    startDate: "2026-03-03",
    endDate: "2026-03-09",
    createdAt: "2026-01-01T00:00:00Z",
    days: [
      day(1, "2026-03-03", "breakfast", "Overnight Oats"),
      day(2, "2026-03-04", "breakfast", "Overnight Oats"),
      day(3, "2026-03-05", "breakfast", "Overnight Oats"),
      day(4, "2026-03-03", "lunch", "Chicken Caesar Salad", "chicken"),
      day(5, "2026-03-04", "lunch", "Greek Salad"),
      day(6, "2026-03-03", "dinner", "Chicken Stir Fry", "chicken"),
      day(7, "2026-03-04", "dinner", "Beef Tacos", "beef"),
      day(8, "2026-03-05", "dinner", "Salmon Fillets", "fish"),
    ],
  },
  {
    id: 2,
    name: "Week of 10 March",
    startDate: "2026-03-10",
    endDate: "2026-03-16",
    createdAt: "2026-01-02T00:00:00Z",
    days: [
      day(9, "2026-03-10", "dinner", "Irish Stew", "beef", true),
      day(10, "2026-03-11", "dinner", "Mushroom Risotto", "chicken"),
      day(11, "2026-03-12", "dinner", "Fish and Chips", "fish"),
    ],
  },
];

function withPlans(plans: MealPlan[]) {
  return (Story: React.ComponentType) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(["mealPlans"], plans);
    return (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    );
  };
}

const meta = {
  title: "Meal Plans/MealPlanList",
  component: MealPlanList,
  tags: ["autodocs"],
} satisfies Meta<typeof MealPlanList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPlans: Story = {
  decorators: [withPlans(mockPlans)],
};

export const Empty: Story = {
  decorators: [withPlans([])],
};
