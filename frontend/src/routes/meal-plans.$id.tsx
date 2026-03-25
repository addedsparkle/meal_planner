import { createFileRoute } from "@tanstack/react-router";
import { MealPlanDetailPage } from "../pages/MealPlanDetailPage";

export const Route = createFileRoute("/meal-plans/$id")({
  component: MealPlanDetailPage,
  validateSearch: (search: Record<string, unknown>) => ({
    edit: search.edit === true || search.edit === "true",
  }),
});
