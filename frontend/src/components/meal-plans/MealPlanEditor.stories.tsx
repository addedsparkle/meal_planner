import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MealPlanEditor } from "./MealPlanEditor";
import type { MealPlan, Recipe } from "../../lib/types";

function day(id: number, date: string, mealType: string, name: string, protein: string | null = null, freezable = false) {
  return { id, dayDate: date, mealType, recipe: { id, name, protein, freezable, description: null } };
}

function recipe(id: number, name: string, protein: string | null, mealTypes: string[], freezable = false): Recipe {
  return {
    id,
    name,
    protein,
    mealTypes,
    freezable,
    description: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ingredients: [],
  };
}

const mockPlan: MealPlan = {
  id: 1,
  name: "Week of 3 March",
  startDate: "2026-03-03",
  endDate: "2026-03-09",
  createdAt: "2026-01-01T00:00:00Z",
  days: [
    day(10, "2026-03-03", "breakfast", "Overnight Oats"),
    day(11, "2026-03-04", "breakfast", "Overnight Oats"),
    day(12, "2026-03-05", "breakfast", "Overnight Oats"),
    day(13, "2026-03-06", "breakfast", "Blueberry Buns"),
    day(14, "2026-03-07", "breakfast", "Blueberry Buns"),
    day(15, "2026-03-08", "breakfast", "Blueberry Buns"),
    day(16, "2026-03-09", "breakfast", "Pancakes"),
    day(20, "2026-03-03", "lunch", "Chicken Caesar Salad", "chicken"),
    day(21, "2026-03-04", "lunch", "Greek Salad"),
    day(22, "2026-03-05", "lunch", "Kedgeree", "fish"),
    day(23, "2026-03-06", "lunch", "Dijon Pork", "pork"),
    day(24, "2026-03-07", "lunch", "Chicken Caesar Salad", "chicken"),
    day(25, "2026-03-08", "lunch", "Fish Finger Butties", "fish"),
    day(26, "2026-03-09", "lunch", "Loaded Sweet Potato Jackets"),
    day(30, "2026-03-03", "dinner", "Chicken Stir Fry", "chicken"),
    day(31, "2026-03-04", "dinner", "Beef Tacos", "beef"),
    day(32, "2026-03-05", "dinner", "Salmon Fillets", "fish"),
    day(33, "2026-03-06", "dinner", "Keema Matar", "beef", true),
    day(34, "2026-03-07", "dinner", "Pork Fried Rice", "pork"),
    day(35, "2026-03-08", "dinner", "Vegetable Curry", null, true),
    day(36, "2026-03-09", "dinner", "Lasagne", "beef"),
  ],
};

const mockRecipes: Recipe[] = [
  recipe(30, "Chicken Stir Fry", "chicken", ["dinner"]),
  recipe(31, "Beef Tacos", "beef", ["dinner"]),
  recipe(32, "Salmon Fillets", "fish", ["dinner"]),
  recipe(33, "Keema Matar", "beef", ["dinner"], true),
  recipe(34, "Pork Fried Rice", "pork", ["dinner"]),
  recipe(35, "Vegetable Curry", null, ["dinner"], true),
  recipe(36, "Lasagne", "beef", ["dinner"]),
  recipe(37, "Irish Stew", "beef", ["dinner"], true),
  recipe(38, "Fish and Chips", "fish", ["dinner"]),
  recipe(20, "Chicken Caesar Salad", "chicken", ["lunch"]),
  recipe(21, "Greek Salad", null, ["lunch"]),
  recipe(22, "Kedgeree", "fish", ["lunch", "breakfast"]),
  recipe(23, "Dijon Pork", "pork", ["lunch"]),
  recipe(10, "Overnight Oats", null, ["breakfast"]),
  recipe(13, "Blueberry Buns", null, ["breakfast"]),
  recipe(16, "Pancakes", null, ["breakfast"]),
];

function withData(Story: React.ComponentType) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(["recipes"], mockRecipes);
  return (
    <QueryClientProvider client={queryClient}>
      <Story />
    </QueryClientProvider>
  );
}

const meta = {
  title: "Meal Plans/MealPlanEditor",
  component: MealPlanEditor,
  tags: ["autodocs"],
  decorators: [withData],
  args: { plan: mockPlan },
} satisfies Meta<typeof MealPlanEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DinnerOnly: Story = {
  args: {
    plan: {
      ...mockPlan,
      name: "Dinner Only Week",
      days: mockPlan.days.filter((d) => d.mealType === "dinner"),
    },
  },
};
