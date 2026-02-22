import { ShoppingCart } from "lucide-react";

export function ShoppingListPage() {
  return (
    <div className="rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
      <ShoppingCart className="mx-auto h-10 w-10 text-gray-300" />
      <p className="mt-3 text-sm font-medium text-gray-500">Shopping list coming soon</p>
      <p className="mt-1 text-xs text-gray-400">
        Generate a meal plan first, then view the combined shopping list here.
      </p>
    </div>
  );
}
