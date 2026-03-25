import { useState } from "react";
import { CalendarDays, Plus, Trash2, Wand2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "../ui/Button";
import { Card, CardBody, CardFooter } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { ErrorMessage } from "../ui/ErrorMessage";
import { MealPlanGenerator } from "./MealPlanGenerator";
import { useMealPlans, useDeleteMealPlan } from "../../hooks/useMealPlans";
import type { MealPlan } from "../../lib/types";

function formatDateRange(startDate: string, endDate: string): string {
  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  return `${fmt(startDate)} – ${fmt(endDate)}`;
}

function MealPlanCard({
  plan,
  onDelete,
  deleting,
}: {
  plan: MealPlan;
  onDelete: (plan: MealPlan) => void;
  deleting?: boolean;
}) {
  const dinnerCount = plan.days.filter((d) => d.mealType === "dinner").length;
  const hasBreakfast = plan.days.some((d) => d.mealType === "breakfast");
  const hasLunch = plan.days.some((d) => d.mealType === "lunch");

  const mealTypeSummary = [
    hasBreakfast && "breakfast",
    hasLunch && "lunch",
    dinnerCount > 0 && "dinner",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card className="flex flex-col">
      <CardBody className="flex-1">
        <Link to="/meal-plans/$id" params={{ id: String(plan.id) }} search={{ edit: false }}>
          <h3 className="font-semibold text-gray-900 transition-colors hover:text-blue-600">
            {plan.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-gray-500">
          {formatDateRange(plan.startDate, plan.endDate)}
        </p>
        {mealTypeSummary && (
          <p className="mt-2 text-xs capitalize text-gray-400">{mealTypeSummary}</p>
        )}
      </CardBody>
      <CardFooter className="flex justify-end gap-2">
        <Link
          to="/meal-plans/$id"
          params={{ id: String(plan.id) }}
          search={{ edit: false }}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"    >
          <CalendarDays className="h-3.5 w-3.5" />
          View
        </Link>
        <Button
          size="sm"
          variant="danger"
          onClick={() => {
            if (window.confirm(`Delete "${plan.name}"?`)) onDelete(plan);
          }}
          loading={deleting}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export function MealPlanList() {
  const { data: plans = [], isLoading, error } = useMealPlans();
  const deletePlan = useDeleteMealPlan();
  const [showGenerate, setShowGenerate] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(plan: MealPlan) {
    setDeletingId(plan.id);
    try {
      await deletePlan.mutateAsync(plan.id);
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading meal plans…</p>;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Meal Plans</h2>
        <Button onClick={() => setShowGenerate(true)}>
          <Wand2 className="h-4 w-4" />
          Generate Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">No meal plans yet</p>
          <p className="mt-1 text-xs text-gray-400">Generate one to get started</p>
          <Button className="mt-4" onClick={() => setShowGenerate(true)}>
            <Plus className="h-4 w-4" />
            Generate Plan
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <MealPlanCard
              key={plan.id}
              plan={plan}
              onDelete={handleDelete}
              deleting={deletingId === plan.id}
            />
          ))}
        </div>
      )}

      <Modal
        open={showGenerate}
        onClose={() => setShowGenerate(false)}
        title="Generate Meal Plan"
      >
        <MealPlanGenerator
          onSuccess={() => setShowGenerate(false)}
          onCancel={() => setShowGenerate(false)}
        />
      </Modal>
    </div>
  );
}
