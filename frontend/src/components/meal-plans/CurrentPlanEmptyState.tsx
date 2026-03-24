import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { MealPlanGenerator } from "./MealPlanGenerator";

export function CurrentPlanEmptyState() {
  const [showGenerate, setShowGenerate] = useState(false);

  return (
    <>
      <div className="rounded-lg border-2 border-dashed border-gray-200 py-16 text-center">
        <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 text-sm font-medium text-gray-500">No active meal plan</p>
        <p className="mt-1 text-xs text-gray-400">
          You don't have a meal plan covering today
        </p>
        <Button className="mt-4" onClick={() => setShowGenerate(true)}>
          <Plus className="h-4 w-4" />
          Generate Plan
        </Button>
      </div>

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
    </>
  );
}
