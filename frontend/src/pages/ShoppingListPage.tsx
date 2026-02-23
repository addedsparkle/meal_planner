import { useState, useMemo } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useMealPlans } from "../hooks/useMealPlans";
import { useShoppingList } from "../hooks/useShoppingList";
import { Spinner } from "../components/ui/Spinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import type { ShoppingListItem } from "../lib/types";

function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

function quantitySummary(quantities: ShoppingListItem["quantities"]): string {
  return quantities
    .map((q) => (q.quantity ? `${q.quantity} (${q.recipeName})` : q.recipeName))
    .join(" · ");
}

export function ShoppingListPage() {
  const { data: mealPlans = [], isLoading: plansLoading, error: plansError } = useMealPlans();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const { data: shoppingList, isLoading: listLoading, error: listError } = useShoppingList(
    Array.from(selectedIds),
  );

  function togglePlan(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setCheckedItems(new Set());
  }

  function toggleItem(ingredientId: number) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(ingredientId)) next.delete(ingredientId);
      else next.add(ingredientId);
      return next;
    });
  }

  // Group by category; uncategorised at the end
  const groupedItems = useMemo(() => {
    if (!shoppingList?.items.length) return [];
    const groups = new Map<string, ShoppingListItem[]>();
    for (const item of shoppingList.items) {
      const key = item.category ?? "";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === "" && b !== "") return 1;
      if (b === "" && a !== "") return -1;
      return a.localeCompare(b);
    });
  }, [shoppingList]);

  const totalItems = shoppingList?.items.length ?? 0;
  const checkedCount = checkedItems.size;

  if (plansLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (plansError) return <ErrorMessage error={plansError} />;

  if (mealPlans.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
        <ShoppingCart className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-500">No meal plans yet</p>
        <p className="mt-1 text-xs text-gray-400">
          Generate a meal plan first, then view the combined shopping list here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Shopping List</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Select one or more meal plans to build a combined list.
        </p>
      </div>

      {/* Plan selector */}
      <div className="flex flex-wrap gap-2">
        {mealPlans.map((plan) => {
          const selected = selectedIds.has(plan.id);
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => togglePlan(plan.id)}
              className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                selected
                  ? "border-blue-400 bg-blue-50 text-blue-900"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <p className="text-sm font-medium">{plan.name}</p>
              <p className={`text-xs ${selected ? "text-blue-500" : "text-gray-400"}`}>
                {formatDateRange(plan.startDate, plan.endDate)}
              </p>
            </button>
          );
        })}
      </div>

      {/* No plan selected */}
      {selectedIds.size === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-12 text-center">
          <ShoppingCart className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">
            Select a meal plan above to see the shopping list.
          </p>
        </div>
      )}

      {selectedIds.size > 0 && listLoading && (
        <div className="flex h-32 items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}

      {listError && <ErrorMessage error={listError} />}

      {shoppingList && shoppingList.items.length === 0 && (
        <p className="text-sm text-gray-500">
          No ingredients found. The selected meal plan recipes may not have any ingredients added.
        </p>
      )}

      {groupedItems.length > 0 && (
        <div className="flex flex-col gap-6">
          {/* Progress & clear */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {checkedCount > 0 ? `${checkedCount} of ${totalItems} items checked` : `${totalItems} items`}
            </p>
            {checkedCount > 0 && (
              <button
                type="button"
                onClick={() => setCheckedItems(new Set())}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Clear checked
              </button>
            )}
          </div>

          {groupedItems.map(([category, items]) => (
            <div key={category}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                {category || "Uncategorised"}
              </h2>
              <div className="flex flex-col divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
                {items.map((item) => {
                  const checked = checkedItems.has(item.ingredientId);
                  return (
                    <button
                      key={item.ingredientId}
                      type="button"
                      onClick={() => toggleItem(item.ingredientId)}
                      className="flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          checked ? "border-blue-500 bg-blue-500" : "border-gray-300"
                        }`}
                      >
                        {checked && <Check className="h-3 w-3 text-white" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium capitalize transition-colors ${
                            checked ? "text-gray-400 line-through" : "text-gray-800"
                          }`}
                        >
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {quantitySummary(item.quantities)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
