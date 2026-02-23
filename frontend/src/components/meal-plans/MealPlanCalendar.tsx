import { Snowflake } from "lucide-react";
import type { MealPlan, MealPlanDay } from "../../lib/types";

interface MealPlanCalendarProps {
  plan: MealPlan;
}

type DayMeals = {
  breakfast?: MealPlanDay;
  lunch?: MealPlanDay;
  dinner?: MealPlanDay;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

const MEAL_COLORS: Record<string, string> = {
  breakfast: "bg-amber-50 border-amber-200",
  lunch: "bg-blue-50 border-blue-200",
  dinner: "bg-indigo-50 border-indigo-200",
};

const MEAL_LABEL_COLORS: Record<string, string> = {
  breakfast: "text-amber-700",
  lunch: "text-blue-700",
  dinner: "text-indigo-700",
};

export function MealPlanCalendar({ plan }: MealPlanCalendarProps) {
  const dayMap = new Map<string, DayMeals>();
  for (const day of plan.days) {
    const meals = dayMap.get(day.dayDate) ?? {};
    if (day.mealType === "breakfast") meals.breakfast = day;
    else if (day.mealType === "lunch") meals.lunch = day;
    else if (day.mealType === "dinner") meals.dinner = day;
    dayMap.set(day.dayDate, meals);
  }

  const sortedDates = [...dayMap.keys()].sort();
  const weeks = chunkArray(sortedDates, 7);
  const hasMealType = (type: string) => plan.days.some((d) => d.mealType === type);
  const mealTypes = (["breakfast", "lunch", "dinner"] as const).filter(hasMealType);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Mobile: each day as a row (< 800px) ── */}
      <div className="flex flex-col gap-3 min-[800px]:hidden">
        {sortedDates.map((date) => {
          const meals = dayMap.get(date) ?? {};
          return (
            <div key={date} className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="mb-2 text-sm font-semibold text-gray-700">{formatDate(date)}</p>
              <div className="flex flex-col gap-1.5">
                {mealTypes.map((mealType) => {
                  const meal = meals[mealType];
                  if (!meal) return null;
                  return (
                    <div
                      key={mealType}
                      className={`flex items-center gap-2 rounded border px-2 py-1.5 ${MEAL_COLORS[mealType]}`}
                    >
                      <span className={`w-16 shrink-0 text-xs font-semibold ${MEAL_LABEL_COLORS[mealType]}`}>
                        {MEAL_LABELS[mealType]}
                      </span>
                      <span className="flex-1 text-sm font-medium text-gray-800">
                        {meal.recipe.name}
                      </span>
                      {meal.recipe.protein && (
                        <span className="text-xs capitalize text-gray-400">{meal.recipe.protein}</span>
                      )}
                      {meal.recipe.freezable && (
                        <Snowflake className="h-3.5 w-3.5 shrink-0 text-cyan-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop: meal-type rows × day columns (≥ 800px) ── */}
      <div className="hidden min-[800px]:flex flex-col gap-6">
        {weeks.map((weekDates, wi) => (
          <div key={wi} className="grid grid-cols-8 gap-1">
            {/* Header row */}
            <div className="py-1 text-xs font-medium uppercase tracking-wide text-gray-400">
              {wi === 0 ? "Meal" : ""}
            </div>
            {weekDates.map((date) => (
              <div key={date} className="py-1 text-xs font-semibold text-gray-600 whitespace-nowrap">
                {formatDate(date)}
              </div>
            ))}

            {/* Meal rows */}
            {mealTypes.map((mealType) => (
              <>
                <div key={`${mealType}-label`} className={`flex items-center py-1 text-xs font-semibold whitespace-nowrap ${MEAL_LABEL_COLORS[mealType]}`}>
                  {MEAL_LABELS[mealType]}
                </div>
                {weekDates.map((date) => {
                  const meal = dayMap.get(date)?.[mealType];
                  return (
                    <div key={date} className="py-1 flex flex-col">
                      {meal ? (
                        <div className={`flex-1 rounded border px-2 py-1.5 ${MEAL_COLORS[mealType]}`}>
                          <p className="text-sm font-medium leading-tight text-gray-800">{meal.recipe.name}</p>
                          {meal.recipe.protein && (
                            <p className="mt-0.5 text-xs capitalize text-gray-500">{meal.recipe.protein}</p>
                          )}
                          {meal.recipe.freezable && (
                            <Snowflake className="mt-0.5 h-3 w-3 text-cyan-500" />
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 rounded border border-dashed border-gray-200 px-2 py-1.5 text-xs italic text-gray-300">
                          —
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        ))}
      </div>

      {hasMealType("breakfast") && (
        <p className="text-xs italic text-amber-600">
          * Breakfast recipes repeat every 3 days for bulk-cooking convenience.
        </p>
      )}
    </div>
  );
}
