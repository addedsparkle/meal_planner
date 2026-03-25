import { createFileRoute } from "@tanstack/react-router";
import { MealPlansPage } from "../pages/MealPlansPage";

export const Route = createFileRoute("/meal-plans/")({
  component: MealPlansPage,
});
