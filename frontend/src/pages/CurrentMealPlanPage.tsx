import { Link } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import { useMealPlans } from "../hooks/useMealPlans";
import { MealPlanCalendar } from "../components/meal-plans/MealPlanCalendar";
import { CurrentPlanEmptyState } from "../components/meal-plans/CurrentPlanEmptyState";
import { Spinner } from "../components/ui/Spinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";

function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

export function CurrentMealPlanPage() {
  const { data: plans = [], isLoading, error } = useMealPlans();

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  const today = new Date().toISOString().split("T")[0];
  const currentPlan = plans.find(
    (p) => p.startDate <= today && p.endDate >= today,
  );

  if (!currentPlan) {
    return <CurrentPlanEmptyState />;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{currentPlan.name}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {formatDateRange(currentPlan.startDate, currentPlan.endDate)}
          </p>
        </div>
        <Link
          to="/meal-plans/$id"
          params={{ id: String(currentPlan.id) }}
          search={{ edit: true }}
          className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Plan
        </Link>
      </div>
      <MealPlanCalendar plan={currentPlan} />
    </div>
  );
}
