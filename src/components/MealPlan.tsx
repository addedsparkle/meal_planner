import type { WeekPlan } from "../types/WeekPlan";
import { RefreshCw } from "lucide-react";

export const MealPlan = ({
  mealPlan,
  disableReplace,
  replaceRecipe,
}: {
  mealPlan: WeekPlan;
  disableReplace?: boolean;
  replaceRecipe: (index: number) => void;
}) => {
  return (
    <div>
      <div>
        {mealPlan.map((meal, index) => (
          <div key={index}>
            <div>
              <strong>{meal.day}</strong>
              <span>{meal.recipe.name}</span>
            </div>
            <button
              onClick={() => {
                replaceRecipe(index);
              }}
              disabled={disableReplace}
              title="Replace with different recipe"
            >
              <RefreshCw />
            </button>
          </div>
        ))}
      </div>

      {mealPlan.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">
            Recipes This Week
          </h3>
          <p className="text-sm text-gray-600">
            You'll be cooking:{" "}
            {[...new Set(mealPlan.map((meal) => meal.recipe.name))].join(", ")}
          </p>
        </div>
      )}
    </div>
  );
};
