import { useState } from "react";
import { CalendarDays, Plus, Trash2, Wand2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Card, CardBody, CardFooter } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { ErrorMessage } from "../ui/ErrorMessage";
import { MealPlanGenerator } from "./MealPlanGenerator";
import { MealPlanCalendar } from "./MealPlanCalendar";
import { useMealPlans, useDeleteMealPlan } from "../../hooks/useMealPlans";
import type { MealPlan } from "../../lib/types";

type ModalState =
  | { kind: "none" }
  | { kind: "generate" }
  | { kind: "view"; plan: MealPlan };

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
  onView,
  onDelete,
  deleting,
}: {
  plan: MealPlan;
  onView: (plan: MealPlan) => void;
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
        <h3
          className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600"
          onClick={() => onView(plan)}
        >
          {plan.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {formatDateRange(plan.startDate, plan.endDate)}
        </p>
        {mealTypeSummary && (
          <p className="mt-2 text-xs text-gray-400 capitalize">{mealTypeSummary}</p>
        )}
      </CardBody>
      <CardFooter className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => onView(plan)}>
          <CalendarDays className="h-3.5 w-3.5" />
          View
        </Button>
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
  const [modal, setModal] = useState<ModalState>({ kind: "none" });
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
        <Button onClick={() => setModal({ kind: "generate" })}>
          <Wand2 className="h-4 w-4" />
          Generate Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">No meal plans yet</p>
          <p className="mt-1 text-xs text-gray-400">Generate one to get started</p>
          <Button className="mt-4" onClick={() => setModal({ kind: "generate" })}>
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
              onView={(p) => setModal({ kind: "view", plan: p })}
              onDelete={handleDelete}
              deleting={deletingId === plan.id}
            />
          ))}
        </div>
      )}

      {/* Generate modal */}
      <Modal
        open={modal.kind === "generate"}
        onClose={() => setModal({ kind: "none" })}
        title="Generate Meal Plan"
      >
        <MealPlanGenerator
          onSuccess={() => setModal({ kind: "none" })}
          onCancel={() => setModal({ kind: "none" })}
        />
      </Modal>

      {/* View/calendar modal */}
      {modal.kind === "view" && (
        <Modal
          open={true}
          onClose={() => setModal({ kind: "none" })}
          title={modal.plan.name}
          size="2xl"
        >
          <div className="text-xs text-gray-500 mb-4">
            {formatDateRange(modal.plan.startDate, modal.plan.endDate)}
          </div>
          <MealPlanCalendar plan={modal.plan} />
          <div className="mt-4 flex justify-end border-t border-gray-100 pt-3">
            <Button variant="secondary" onClick={() => setModal({ kind: "none" })}>
              Close
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
