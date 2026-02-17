import { useQuery } from "@tanstack/react-query";
import { fetchShoppingList } from "../lib/api";

export function useShoppingList(mealPlanIds: number[]) {
  return useQuery({
    queryKey: ["shoppingList", mealPlanIds],
    queryFn: () => fetchShoppingList(mealPlanIds),
    enabled: mealPlanIds.length > 0,
  });
}
