import type { Meta, StoryObj } from "@storybook/react-vite";
import { RecipeDetail } from "./RecipeDetail";
import type { Recipe } from "../../lib/types";

const base: Recipe = {
  id: 1,
  name: "Chicken Stir Fry",
  description: "Quick Asian-style stir fry with vegetables and soy sauce.",
  protein: "chicken",
  mealTypes: ["dinner"],
  suitableDays: "any",
  freezable: false,
  lastUsedAt: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ingredients: [
    { id: 1, name: "chicken breast", category: null, units: "g", quantity: "400", notes: null },
    { id: 2, name: "broccoli", category: null, units: "g", quantity: "200", notes: null },
    { id: 3, name: "soy sauce", category: null, units: "tbsp", quantity: "3", notes: null },
    { id: 4, name: "garlic", category: null, units: "clove", quantity: "2", notes: "minced" },
  ],
};

const noop = () => {};

const meta = {
  title: "Recipes/RecipeDetail",
  component: RecipeDetail,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-lg">
        <Story />
      </div>
    ),
  ],
  args: { onEdit: noop, onClose: noop },
} satisfies Meta<typeof RecipeDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { recipe: base },
};

export const FreezableMultiMeal: Story = {
  args: {
    recipe: {
      ...base,
      name: "Keema Matar",
      protein: "beef",
      mealTypes: ["dinner", "lunch"],
      freezable: true,
    },
  },
};

export const NoIngredients: Story = {
  args: {
    recipe: {
      ...base,
      name: "Pizza",
      description: null,
      protein: null,
      mealTypes: ["dinner"],
      ingredients: [],
    },
  },
};

export const IngredientWithNotes: Story = {
  args: {
    recipe: {
      ...base,
      ingredients: [
        { id: 1, name: "steak", category: null, units: "piece", quantity: "2", notes: "room temperature" },
        { id: 2, name: "mushrooms", category: null, units: "g", quantity: "200", notes: "sliced" },
        { id: 3, name: "rosemary", category: null, units: "sprig", quantity: "2", notes: "fresh" },
      ],
    },
  },
};

export const RecentlyUsed: Story = {
  args: {
    recipe: {
      ...base,
      name: "Chicken Stir Fry (recently used)",
      lastUsedAt: "2026-02-01",
    },
  },
};
