import { createFileRoute } from "@tanstack/react-router";
import { ShoppingListPage } from "../pages/ShoppingListPage";

export const Route = createFileRoute("/shopping-list")({
  component: ShoppingListPage,
});
