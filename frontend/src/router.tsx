import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link,
} from "@tanstack/react-router";
import type { NotFoundRouteComponent } from "@tanstack/react-router";
import { UtensilsCrossed } from "lucide-react";
import { CurrentMealPlanPage } from "./pages/CurrentMealPlanPage";
import { RecipesPage } from "./pages/RecipesPage";
import { MealPlansPage } from "./pages/MealPlansPage";
import { MealPlanDetailPage } from "./pages/MealPlanDetailPage";
import { ShoppingListPage } from "./pages/ShoppingListPage";

const NAV_LINKS = [
  { to: "/", label: "Current Plan", exact: true },
  { to: "/recipes", label: "Recipes", exact: false },
  { to: "/meal-plans", label: "Meal Plans", exact: false },
  { to: "/shopping-list", label: "Shopping List", exact: false },
] as const;

function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 py-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Meal Planner</h1>
            </div>
            <nav className="flex gap-1">
              {NAV_LINKS.map(({ to, label, exact }) => (
                <Link
                  key={to}
                  to={to}
                  activeProps={{ className: "bg-blue-100 text-blue-700" }}
                  inactiveProps={{ className: "text-gray-600 hover:bg-gray-100 hover:text-gray-900" }}
                  activeOptions={{ exact }}
                  className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

const NotFound: NotFoundRouteComponent = () => (
  <div className="py-16 text-center">
    <p className="text-4xl font-bold text-gray-200">404</p>
    <p className="mt-3 text-sm font-medium text-gray-500">Page not found</p>
    <Link to="/recipes" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
      Go to Recipes
    </Link>
  </div>
);

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: CurrentMealPlanPage,
});

const recipesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/recipes",
  component: RecipesPage,
});

const mealPlansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/meal-plans",
  component: MealPlansPage,
});

const mealPlanDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/meal-plans/$id",
  component: MealPlanDetailPage,
  validateSearch: (search: Record<string, unknown>) => ({
    edit: search.edit === true || search.edit === "true",
  }),
});

const shoppingListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shopping-list",
  component: ShoppingListPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  recipesRoute,
  mealPlansRoute,
  mealPlanDetailRoute,
  shoppingListRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
