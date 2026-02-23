import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ShoppingListPage } from "./ShoppingListPage";
import type { MealPlan, ShoppingListResponse } from "../lib/types";

const mockPlans: MealPlan[] = [
  {
    id: 1,
    name: "Week of 3 March",
    startDate: "2026-03-03",
    endDate: "2026-03-09",
    createdAt: "2026-01-01T00:00:00Z",
    days: [],
  },
  {
    id: 2,
    name: "Week of 10 March",
    startDate: "2026-03-10",
    endDate: "2026-03-16",
    createdAt: "2026-01-02T00:00:00Z",
    days: [],
  },
];

const mockShoppingList: ShoppingListResponse = {
  mealPlanIds: [1],
  items: [
    {
      ingredientId: 1,
      name: "chicken breast",
      category: "meat",
      quantities: [
        { quantity: "400g", recipeName: "Chicken Stir Fry", dayDate: "2026-03-03" },
        { quantity: "300g", recipeName: "Chicken Caesar Salad", dayDate: "2026-03-05" },
      ],
    },
    {
      ingredientId: 2,
      name: "beef mince",
      category: "meat",
      quantities: [
        { quantity: "500g", recipeName: "Beef Tacos", dayDate: "2026-03-04" },
      ],
    },
    {
      ingredientId: 3,
      name: "broccoli",
      category: "vegetables",
      quantities: [
        { quantity: "200g", recipeName: "Chicken Stir Fry", dayDate: "2026-03-03" },
      ],
    },
    {
      ingredientId: 4,
      name: "cherry tomatoes",
      category: "vegetables",
      quantities: [
        { quantity: "250g", recipeName: "Beef Tacos", dayDate: "2026-03-04" },
        { quantity: "200g", recipeName: "Chicken Caesar Salad", dayDate: "2026-03-05" },
      ],
    },
    {
      ingredientId: 5,
      name: "soy sauce",
      category: "condiments",
      quantities: [
        { quantity: "3 tbsp", recipeName: "Chicken Stir Fry", dayDate: "2026-03-03" },
      ],
    },
    {
      ingredientId: 6,
      name: "olive oil",
      category: "condiments",
      quantities: [
        { quantity: "2 tbsp", recipeName: "Chicken Stir Fry", dayDate: "2026-03-03" },
        { quantity: "1 tbsp", recipeName: "Chicken Caesar Salad", dayDate: "2026-03-05" },
      ],
    },
    {
      ingredientId: 7,
      name: "garlic",
      category: null,
      quantities: [
        { quantity: "3 cloves", recipeName: "Chicken Stir Fry", dayDate: "2026-03-03" },
        { quantity: "2 cloves", recipeName: "Beef Tacos", dayDate: "2026-03-04" },
      ],
    },
  ],
};

function makeDecorator(plans: MealPlan[], list?: ShoppingListResponse) {
  return (Story: React.ComponentType) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    queryClient.setQueryData(["mealPlans"], plans);
    if (list) {
      queryClient.setQueryData(["shoppingList", list.mealPlanIds], list);
    }
    return (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    );
  };
}

const meta = {
  title: "Pages/ShoppingListPage",
  component: ShoppingListPage,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof ShoppingListPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoPlans: Story = {
  decorators: [makeDecorator([])],
};

export const PlansAvailable: Story = {
  decorators: [makeDecorator(mockPlans, mockShoppingList)],
};

export const MultipleItemsNoCategory: Story = {
  decorators: [
    makeDecorator(
      [mockPlans[0]!],
      {
        mealPlanIds: [1],
        items: mockShoppingList.items.map((i) => ({ ...i, category: null })),
      },
    ),
  ],
};

export const EmptyIngredients: Story = {
  decorators: [
    makeDecorator([mockPlans[0]!], { mealPlanIds: [1], items: [] }),
  ],
};
