import type { Meta, StoryObj } from "@storybook/react-vite";
import { RecipeForm } from "./RecipeForm";
import type { Recipe } from "../../lib/types";

const noop = () => {};

const existingRecipe: Recipe = {
  id: 1,
  name: "Chicken Stir Fry",
  description: "Quick Asian-style stir fry with vegetables.",
  protein: "chicken",
  mealTypes: ["dinner"],
  suitableDays: "any",
  freezable: false,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ingredients: [
    { id: 1, name: "chicken breast", category: null, units: "g", quantity: "400", notes: null },
    { id: 2, name: "broccoli", category: null, units: "g", quantity: "200", notes: null },
    { id: 3, name: "soy sauce", category: null, units: "tbsp", quantity: "3", notes: null },
  ],
};

const meta = {
  title: "Recipes/RecipeForm",
  component: RecipeForm,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
  args: { onSuccess: noop, onCancel: noop },
} satisfies Meta<typeof RecipeForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateMode: Story = {};

export const EditMode: Story = {
  args: { recipe: existingRecipe },
};

export const EditWithMultipleMealTypes: Story = {
  args: {
    recipe: {
      ...existingRecipe,
      name: "Kedgeree",
      protein: "fish",
      mealTypes: ["breakfast", "lunch", "dinner"],
      freezable: false,
    },
  },
};

export const EditFreezable: Story = {
  args: {
    recipe: {
      ...existingRecipe,
      name: "Beef Bolognese",
      protein: "beef",
      freezable: true,
    },
  },
};

export const EditBreakfastWeekday: Story = {
  args: {
    recipe: {
      ...existingRecipe,
      name: "Overnight Oats",
      protein: null,
      mealTypes: ["breakfast"],
      suitableDays: "weekday",
      freezable: false,
      ingredients: [],
    },
  },
};

export const EditBreakfastWeekend: Story = {
  args: {
    recipe: {
      ...existingRecipe,
      name: "Shakshuka",
      protein: "eggs",
      mealTypes: ["breakfast"],
      suitableDays: "weekend",
      freezable: false,
      ingredients: [],
    },
  },
};
