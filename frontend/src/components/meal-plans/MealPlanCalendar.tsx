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
  // Build a map: date → { breakfast, lunch, dinner }
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

  return (
    <div className="flex flex-col gap-6">
      {weeks.map((weekDates, wi) => (
        <div key={wi} className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-20 py-1 pr-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">
                  {wi === 0 ? "Meal" : ""}
                </th>
                {weekDates.map((date) => (
                  <th key={date} className="px-2 py-1 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">
                    {formatDate(date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(["breakfast", "lunch", "dinner"] as const).filter(hasMealType).map((mealType) => (
                <tr key={mealType}>
                  <td className={`py-2 pr-3 text-xs font-semibold whitespace-nowrap ${MEAL_LABEL_COLORS[mealType]}`}>
                    {MEAL_LABELS[mealType]}
                  </td>
                  {weekDates.map((date) => {
                    const meal = dayMap.get(date)?.[mealType];
                    return (
                      <td key={date} className="px-1 py-1">
                        {meal ? (
                          <div className={`rounded border px-2 py-1.5 ${MEAL_COLORS[mealType]}`}>
                            <p className="font-medium text-gray-800 leading-tight">{meal.recipe.name}</p>
                            {meal.recipe.protein && (
                              <p className="text-xs text-gray-500 capitalize mt-0.5">{meal.recipe.protein}</p>
                            )}
                            {meal.recipe.freezable && (
                              <Snowflake className="h-3 w-3 text-cyan-500 mt-0.5" />
                            )}
                          </div>
                        ) : (
                          <div className="rounded border border-dashed border-gray-200 px-2 py-1.5 text-xs text-gray-300 italic">
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {hasMealType("breakfast") && (
        <p className="text-xs text-amber-600 italic">
          * Breakfast recipes repeat every 3 days for bulk-cooking convenience.
        </p>
      )}
    </div>
  );
}
