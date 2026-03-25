import { useState } from "react";
import { ArrowLeftRight, Snowflake } from "lucide-react";
import { ErrorMessage } from "../ui/ErrorMessage";
import { Spinner } from "../ui/Spinner";
import { useUpdateMealPlan } from "../../hooks/useMealPlans";
import { useRecipes } from "../../hooks/useRecipes";
import type { MealPlan, MealPlanDay, MealPlanDayRecipe } from "../../lib/types";
import type { Recipe } from "../../lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

function formatDateLong(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "short",
  });
}

// ── Shared constants ──────────────────────────────────────────────────────────

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

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

type DayMeals = {
  breakfast?: MealPlanDay;
  lunch?: MealPlanDay;
  dinner?: MealPlanDay;
};

interface SelectedCell {
  dayDate: string;
  mealType: string;
}

// ── RecipePicker ──────────────────────────────────────────────────────────────
// Shared between mobile (inline per day) and desktop (below table) layouts.

interface RecipePickerProps {
  heading: string;
  availableRecipes: Recipe[];
  currentRecipeId: number | undefined;
  onSwap: (recipe: Recipe) => void;
  onCancel: () => void;
  isPending: boolean;
}

function RecipePicker({
  heading,
  availableRecipes,
  currentRecipeId,
  onSwap,
  onCancel,
  isPending,
}: RecipePickerProps) {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-blue-800">{heading}</p>
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 text-xs text-blue-400 hover:text-blue-600"
        >
          Cancel
        </button>
      </div>

      {availableRecipes.length === 0 ? (
        <p className="text-xs text-blue-600">No recipes available for this meal type.</p>
      ) : (
        <div className="grid max-h-48 grid-cols-2 gap-1.5 overflow-y-auto sm:grid-cols-3">
          {availableRecipes.map((recipe) => {
            const isCurrent = recipe.id === currentRecipeId;
            return (
              <button
                key={recipe.id}
                type="button"
                onClick={() => { if (!isCurrent) onSwap(recipe); }}
                disabled={isCurrent || isPending}
                className={`rounded border px-2 py-1.5 text-left text-xs transition-colors ${
                  isCurrent
                    ? "cursor-default border-blue-300 bg-blue-100 text-blue-500"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-400"
                }`}
              >
                <p className="font-medium leading-tight">{recipe.name}</p>
                {recipe.protein && (
                  <p className="mt-0.5 capitalize text-gray-400">{recipe.protein}</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── MobileEditorView ──────────────────────────────────────────────────────────
// Each day is a card. Tapping the swap icon on a meal reveals the recipe picker
// inline below that day's card, keeping the context clear on small screens.

interface MobileEditorViewProps {
  sortedDates: string[];
  dayMap: Map<string, DayMeals>;
  mealTypes: ("breakfast" | "lunch" | "dinner")[];
  selectedCell: SelectedCell | null;
  onSelectCell: (cell: SelectedCell | null) => void;
  availableRecipes: Recipe[];
  currentRecipeId: number | undefined;
  onSwap: (recipe: Recipe) => void;
  isPending: boolean;
}

function MobileEditorView({
  sortedDates,
  dayMap,
  mealTypes,
  selectedCell,
  onSelectCell,
  availableRecipes,
  currentRecipeId,
  onSwap,
  isPending,
}: MobileEditorViewProps) {
  return (
    <div className="flex flex-col gap-3">
      {sortedDates.map((date) => {
        const meals = dayMap.get(date) ?? {};
        const pickerOpenForThisDay = selectedCell?.dayDate === date;

        return (
          <div key={date} className="rounded-lg border border-gray-200 bg-white p-3">
            <p className="mb-2 text-sm font-semibold text-gray-700">{formatDate(date)}</p>

            <div className="flex flex-col gap-1.5">
              {mealTypes.map((mealType) => {
                const meal = meals[mealType];
                if (!meal) return null;
                const isSelected = selectedCell?.dayDate === date && selectedCell?.mealType === mealType;
                return (
                  <div
                    key={mealType}
                    className={`flex items-center gap-2 rounded border px-2 py-1.5 ${MEAL_COLORS[mealType]} ${
                      isSelected ? "ring-2 ring-blue-400" : ""
                    }`}
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
                    <button
                      type="button"
                      onClick={() => onSelectCell(isSelected ? null : { dayDate: date, mealType })}
                      disabled={isPending}
                      className="shrink-0 text-gray-400 transition-colors hover:text-blue-500"
                      title="Swap recipe"
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Picker appears immediately below this day when a meal is selected */}
            {pickerOpenForThisDay && selectedCell && (
              <div className="mt-2">
                <RecipePicker
                  heading={`Replace ${MEAL_LABELS[selectedCell.mealType]}`}
                  availableRecipes={availableRecipes}
                  currentRecipeId={currentRecipeId}
                  onSwap={onSwap}
                  onCancel={() => onSelectCell(null)}
                  isPending={isPending}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── DesktopEditorView ─────────────────────────────────────────────────────────
// Meal-type rows × day columns. The recipe picker is rendered separately below
// the table by the parent component.

interface DesktopEditorViewProps {
  weeks: string[][];
  dayMap: Map<string, DayMeals>;
  mealTypes: ("breakfast" | "lunch" | "dinner")[];
  selectedCell: SelectedCell | null;
  onSelectCell: (cell: SelectedCell | null) => void;
  isPending: boolean;
}

function DesktopEditorView({
  weeks,
  dayMap,
  mealTypes,
  selectedCell,
  onSelectCell,
  isPending,
}: DesktopEditorViewProps) {
  return (
    <div className="flex flex-col gap-6">
      {weeks.map((weekDates, wi) => (
        <div key={wi} className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-20 py-1 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
                  {wi === 0 ? "Meal" : ""}
                </th>
                {weekDates.map((date) => (
                  <th key={date} className="whitespace-nowrap px-2 py-1 text-left text-xs font-semibold text-gray-600">
                    {formatDate(date)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mealTypes.map((mealType) => (
                <tr key={mealType}>
                  <td className={`whitespace-nowrap py-2 pr-3 text-xs font-semibold ${MEAL_LABEL_COLORS[mealType]}`}>
                    {MEAL_LABELS[mealType]}
                  </td>
                  {weekDates.map((date) => {
                    const meal = dayMap.get(date)?.[mealType];
                    const isSelected = selectedCell?.dayDate === date && selectedCell?.mealType === mealType;
                    return (
                      <td key={date} className="px-1 py-1">
                        {meal ? (
                          <div className={`rounded border px-2 py-1.5 ${MEAL_COLORS[mealType]} ${isSelected ? "ring-2 ring-blue-400" : ""}`}>
                            <p className="text-xs font-medium leading-tight text-gray-800">
                              {meal.recipe.name}
                            </p>
                            {meal.recipe.protein && (
                              <p className="mt-0.5 text-xs capitalize text-gray-500">{meal.recipe.protein}</p>
                            )}
                            <div className="mt-1 flex items-center justify-between">
                              {meal.recipe.freezable ? (
                                <Snowflake className="h-3 w-3 text-cyan-500" />
                              ) : (
                                <span />
                              )}
                              <button
                                type="button"
                                onClick={() => onSelectCell(isSelected ? null : { dayDate: date, mealType })}
                                disabled={isPending}
                                className="text-gray-400 transition-colors hover:text-blue-500"
                                title="Swap recipe"
                              >
                                <ArrowLeftRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="rounded border border-dashed border-gray-200 px-2 py-1.5 text-xs italic text-gray-300">
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
    </div>
  );
}

// ── MealPlanEditor ────────────────────────────────────────────────────────────

export interface MealPlanEditorProps {
  plan: MealPlan;
}

export function MealPlanEditor({ plan }: MealPlanEditorProps) {
  const [days, setDays] = useState<MealPlanDay[]>(() => plan.days);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const updatePlan = useUpdateMealPlan();
  const { data: recipes = [] } = useRecipes();

  // Build day map for both views
  const dayMap = new Map<string, DayMeals>();
  for (const day of days) {
    const meals = dayMap.get(day.dayDate) ?? {};
    if (day.mealType === "breakfast") meals.breakfast = day;
    else if (day.mealType === "lunch") meals.lunch = day;
    else if (day.mealType === "dinner") meals.dinner = day;
    dayMap.set(day.dayDate, meals);
  }

  const sortedDates = [...dayMap.keys()].sort();
  const weeks = chunkArray(sortedDates, 7);
  const mealTypes = (["breakfast", "lunch", "dinner"] as const).filter(
    (type) => days.some((d) => d.mealType === type)
  );

  const availableRecipes = selectedCell
    ? recipes.filter((r) => r.mealTypes.includes(selectedCell.mealType))
    : [];

  const selectedDayMeal = selectedCell
    ? dayMap.get(selectedCell.dayDate)?.[selectedCell.mealType as "breakfast" | "lunch" | "dinner"]
    : undefined;

  async function handleSwap(recipe: Recipe) {
    if (!selectedCell) return;
    const originalDays = days;
    setSaveError(null);

    const newRecipeData: MealPlanDayRecipe = {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      protein: recipe.protein,
      freezable: recipe.freezable,
    };

    const newDays = days.map((d) =>
      d.dayDate === selectedCell.dayDate && d.mealType === selectedCell.mealType
        ? { ...d, recipe: newRecipeData }
        : d
    );

    setDays(newDays);
    setSelectedCell(null);

    try {
      await updatePlan.mutateAsync({
        id: plan.id,
        data: {
          name: plan.name,
          startDate: plan.startDate,
          endDate: plan.endDate,
          days: newDays.map((d) => ({
            dayDate: d.dayDate,
            recipeId: d.recipe.id,
            mealType: d.mealType ?? undefined,
          })),
        },
      });
    } catch (err) {
      setDays(originalDays);
      setSaveError(err instanceof Error ? err : new Error("Save failed"));
    }
  }

  const sharedProps = {
    availableRecipes,
    currentRecipeId: selectedDayMeal?.recipe.id,
    onSwap: handleSwap,
    isPending: updatePlan.isPending,
  };

  const desktopPickerHeading = selectedCell
    ? `Replace ${MEAL_LABELS[selectedCell.mealType]} · ${formatDateLong(selectedCell.dayDate)}${
        selectedDayMeal ? ` — currently: ${selectedDayMeal.recipe.name}` : ""
      }`
    : "";

  return (
    <div className="flex flex-col gap-4">

      {/* Mobile layout (< 800px): per-day cards with inline picker */}
      <div className="min-[800px]:hidden">
        <MobileEditorView
          sortedDates={sortedDates}
          dayMap={dayMap}
          mealTypes={mealTypes}
          selectedCell={selectedCell}
          onSelectCell={setSelectedCell}
          {...sharedProps}
        />
      </div>

      {/* Desktop layout (≥ 800px): table with picker below */}
      <div className="hidden min-[800px]:flex flex-col gap-4">
        <DesktopEditorView
          weeks={weeks}
          dayMap={dayMap}
          mealTypes={mealTypes}
          selectedCell={selectedCell}
          onSelectCell={setSelectedCell}
          isPending={updatePlan.isPending}
        />
        {selectedCell && (
          <RecipePicker
            heading={desktopPickerHeading}
            onCancel={() => setSelectedCell(null)}
            {...sharedProps}
          />
        )}
      </div>

      {saveError && <ErrorMessage error={saveError} />}

      {updatePlan.isPending && (
        <p className="flex items-center gap-1 text-xs text-gray-400">
          <Spinner size="sm" /> Saving…
        </p>
      )}
    </div>
  );
}
