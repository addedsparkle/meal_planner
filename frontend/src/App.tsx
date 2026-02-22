import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RecipeList } from "./components/recipes/RecipeList";
import { MealPlanList } from "./components/meal-plans/MealPlanList";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

type Tab = "recipes" | "meal-plans";

const TABS: { id: Tab; label: string }[] = [
  { id: "recipes", label: "Recipes" },
  { id: "meal-plans", label: "Meal Plans" },
];

function App() {
  const [tab, setTab] = useState<Tab>("recipes");

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8 py-4">
              <h1 className="text-2xl font-bold text-gray-900">Meal Planner</h1>
              <nav className="flex gap-1">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={[
                      "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                      tab === t.id
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    ].join(" ")}
                  >
                    {t.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {tab === "recipes" && <RecipeList />}
          {tab === "meal-plans" && <MealPlanList />}
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
