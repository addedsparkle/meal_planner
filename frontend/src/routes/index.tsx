import { createFileRoute } from "@tanstack/react-router";
import { CurrentMealPlanPage } from "../pages/CurrentMealPlanPage";

export const Route = createFileRoute("/")({
  component: CurrentMealPlanPage,
});
