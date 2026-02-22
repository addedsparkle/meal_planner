import { useState } from "react";
import { Link, getRouteApi } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Check } from "lucide-react";
import { useMealPlan } from "../hooks/useMealPlans";
import { MealPlanCalendar } from "../components/meal-plans/MealPlanCalendar";
import { MealPlanEditor } from "../components/meal-plans/MealPlanEditor";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";

const Route = getRouteApi("/meal-plans/$id");

function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

export function MealPlanDetailPage() {
  const { id } = Route.useParams();
  const { data: plan, isLoading, error } = useMealPlan(Number(id));
  const [editing, setEditing] = useState(false);

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

  if (!plan) {
    return <p className="text-sm text-gray-500">Plan not found.</p>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            to="/meal-plans"
            className="mb-1 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Meal Plans
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{plan.name}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {formatDateRange(plan.startDate, plan.endDate)}
          </p>
        </div>

        {editing ? (
          <Button variant="secondary" onClick={() => setEditing(false)}>
            <Check className="h-4 w-4" />
            Done Editing
          </Button>
        ) : (
          <Button onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4" />
            Edit Plan
          </Button>
        )}
      </div>

      {/* Content */}
      {editing ? (
        <MealPlanEditor plan={plan} />
      ) : (
        <MealPlanCalendar plan={plan} />
      )}
    </div>
  );
}
