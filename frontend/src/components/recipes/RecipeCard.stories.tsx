import type { Meta, StoryObj } from "@storybook/react-vite";
import { RecipeCard } from "./RecipeCard";
import type { Recipe } from "../../lib/types";

const base: Recipe = {
  id: 1,
  name: "Chicken Stir Fry",
  description: "Quick Asian-style stir fry with vegetables and soy sauce.",
  protein: "chicken",
  mealTypes: ["dinner"],
  freezable: false,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  ingredients: [
    { id: 1, name: "chicken breast", category: null, quantity: "400g", notes: null },
    { id: 2, name: "broccoli", category: null, quantity: "200g", notes: null },
    { id: 3, name: "soy sauce", category: null, quantity: "3 tbsp", notes: null },
  ],
};

const noop = () => {};

const meta = {
  title: "Recipes/RecipeCard",
  component: RecipeCard,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
  args: {
    onView: noop,
    onEdit: noop,
    onDelete: noop,
  },
} satisfies Meta<typeof RecipeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { recipe: base },
};

export const Freezable: Story = {
  args: {
    recipe: { ...base, name: "Beef Bolognese", protein: "beef", freezable: true },
  },
};

export const MultiMealTypes: Story = {
  args: {
    recipe: {
      ...base,
      name: "Kedgeree",
      protein: "fish",
      mealTypes: ["breakfast", "lunch", "dinner"],
    },
  },
};

export const NoProtein: Story = {
  args: {
    recipe: {
      ...base,
      name: "Overnight Oats",
      protein: null,
      mealTypes: ["breakfast"],
      description: null,
      ingredients: [],
    },
  },
};

export const ManyIngredients: Story = {
  args: {
    recipe: {
      ...base,
      name: "Creamy Cajun Chicken Pasta",
      ingredients: Array.from({ length: 16 }, (_, i) => ({
        id: i + 1,
        name: `ingredient ${i + 1}`,
        category: null,
        quantity: "100g",
        notes: null,
      })),
    },
  },
};

export const Deleting: Story = {
  args: { recipe: base, deleting: true },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      {[
        { ...base, id: 1, name: "Chicken Stir Fry", protein: "chicken" },
        { ...base, id: 2, name: "Beef Tacos", protein: "beef", freezable: true },
        { ...base, id: 3, name: "Salmon Fillets", protein: "fish", mealTypes: ["dinner", "lunch"] as string[] },
        { ...base, id: 4, name: "Overnight Oats", protein: null, mealTypes: ["breakfast"] as string[], ingredients: [] },
      ].map((r) => (
        <RecipeCard key={r.id} recipe={r as Recipe} onView={noop} onEdit={noop} onDelete={noop} />
      ))}
    </div>
  ),
};
