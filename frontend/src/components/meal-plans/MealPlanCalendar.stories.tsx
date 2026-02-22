import type { Meta, StoryObj } from "@storybook/react-vite";
import { MealPlanCalendar } from "./MealPlanCalendar";
import type { MealPlan } from "../../lib/types";

function day(id: number, date: string, mealType: string, name: string, protein: string | null = null, freezable = false) {
  return { id, dayDate: date, mealType, recipe: { id, name, protein, freezable, description: null } };
}

const fullWeekPlan: MealPlan = {
  id: 1,
  name: "Week of 3 March",
  startDate: "2026-03-03",
  endDate: "2026-03-09",
  createdAt: "2026-01-01T00:00:00Z",
  days: [
    // Breakfast — same for 3 days
    day(10, "2026-03-03", "breakfast", "Overnight Oats"),
    day(11, "2026-03-04", "breakfast", "Overnight Oats"),
    day(12, "2026-03-05", "breakfast", "Overnight Oats"),
    day(13, "2026-03-06", "breakfast", "Blueberry Buns"),
    day(14, "2026-03-07", "breakfast", "Blueberry Buns"),
    day(15, "2026-03-08", "breakfast", "Blueberry Buns"),
    day(16, "2026-03-09", "breakfast", "Pancakes"),
    // Lunch
    day(20, "2026-03-03", "lunch", "Chicken Caesar Salad", "chicken"),
    day(21, "2026-03-04", "lunch", "Greek Salad"),
    day(22, "2026-03-05", "lunch", "Kedgeree", "fish"),
    day(23, "2026-03-06", "lunch", "Dijon Pork", "pork"),
    day(24, "2026-03-07", "lunch", "Chicken Caesar Salad", "chicken"),
    day(25, "2026-03-08", "lunch", "Fish Finger Butties", "fish"),
    day(26, "2026-03-09", "lunch", "Loaded Sweet Potato Jackets"),
    // Dinner — protein-distributed
    day(30, "2026-03-03", "dinner", "Chicken Stir Fry", "chicken"),
    day(31, "2026-03-04", "dinner", "Beef Tacos", "beef"),
    day(32, "2026-03-05", "dinner", "Salmon Fillets", "fish"),
    day(33, "2026-03-06", "dinner", "Keema Matar", "beef", true),
    day(34, "2026-03-07", "dinner", "Pork Fried Rice", "pork"),
    day(35, "2026-03-08", "dinner", "Vegetable Curry", null, true),
    day(36, "2026-03-09", "dinner", "Lasagne", "beef"),
  ],
};

const dinnerOnlyPlan: MealPlan = {
  id: 2,
  name: "Dinner Only Week",
  startDate: "2026-03-03",
  endDate: "2026-03-09",
  createdAt: "2026-01-01T00:00:00Z",
  days: [
    day(1, "2026-03-03", "dinner", "Chicken Stir Fry", "chicken"),
    day(2, "2026-03-04", "dinner", "Beef Tacos", "beef"),
    day(3, "2026-03-05", "dinner", "Salmon Fillets", "fish"),
    day(4, "2026-03-06", "dinner", "Keema Matar", "beef", true),
    day(5, "2026-03-07", "dinner", "Pork Fried Rice", "pork"),
    day(6, "2026-03-08", "dinner", "Vegetable Curry", null, true),
    day(7, "2026-03-09", "dinner", "Lasagne", "beef"),
  ],
};

const twoWeekPlan: MealPlan = {
  id: 3,
  name: "Two Week Plan",
  startDate: "2026-03-03",
  endDate: "2026-03-16",
  createdAt: "2026-01-01T00:00:00Z",
  days: [
    ...fullWeekPlan.days,
    day(40, "2026-03-10", "dinner", "Irish Stew", "beef", true),
    day(41, "2026-03-11", "dinner", "Mushroom Risotto", "chicken"),
    day(42, "2026-03-12", "dinner", "Fish and Chips", "fish"),
    day(43, "2026-03-13", "dinner", "Chilli", "beef", true),
    day(44, "2026-03-14", "dinner", "Hot Dogs", "pork"),
    day(45, "2026-03-15", "dinner", "Sweet and Sour Chicken", "chicken"),
    day(46, "2026-03-16", "dinner", "Bolognese Pasta Bake", "beef", true),
  ],
};

const meta = {
  title: "Meal Plans/MealPlanCalendar",
  component: MealPlanCalendar,
  tags: ["autodocs"],
} satisfies Meta<typeof MealPlanCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullWeek: Story = {
  args: { plan: fullWeekPlan },
};

export const DinnerOnly: Story = {
  args: { plan: dinnerOnlyPlan },
};

export const TwoWeeks: Story = {
  args: { plan: twoWeekPlan },
};

export const ShortPlan: Story = {
  args: {
    plan: {
      ...dinnerOnlyPlan,
      name: "Three Days",
      endDate: "2026-03-05",
      days: dinnerOnlyPlan.days.slice(0, 3),
    },
  },
};
