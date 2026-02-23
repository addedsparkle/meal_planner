import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { ErrorMessage } from "../ui/ErrorMessage";
import { useCreateRecipe, useUpdateRecipe } from "../../hooks/useRecipes";
import type { Recipe } from "../../lib/types";

const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;

const UNITS = [
  "count",
  "g", "kg", "ml", "l",
  "tsp", "tbsp", "cup",
  "piece", "slice", "clove", "bunch", "sprig", "handful", "can",
  "pinch", "dash",
] as const;

const SUITABLE_DAYS_OPTIONS = [
  { value: "any", label: "Any day" },
  { value: "weekday", label: "Weekdays only (batch-cook)" },
  { value: "weekend", label: "Weekends only (longer prep)" },
] as const;

const ingredientSchema = z.object({
  name: z.string().min(1, "Required"),
  quantity: z.string().optional(),
  units: z.string().optional(),
  notes: z.string().optional(),
});

const recipeSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  description: z.string().optional(),
  protein: z.string().optional(),
  mealTypes: z.array(z.enum(MEAL_TYPES)).min(1, "Select at least one meal type"),
  suitableDays: z.enum(["any", "weekday", "weekend"]),
  freezable: z.boolean(),
  // No .default([]) — keeps input/output types symmetric so zodResolver types align
  ingredients: z.array(ingredientSchema),
});

type RecipeFormData = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  recipe?: Recipe;
  onSuccess: () => void;
  onCancel: () => void;
}

const ingFieldClass =
  "rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";

export function RecipeForm({ recipe, onSuccess, onCancel }: RecipeFormProps) {
  const createRecipe = useCreateRecipe();
  const updateRecipe = useUpdateRecipe();
  const isEditing = !!recipe;

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: recipe
      ? {
          name: recipe.name,
          description: recipe.description ?? "",
          protein: recipe.protein ?? "",
          mealTypes: recipe.mealTypes.filter((m): m is typeof MEAL_TYPES[number] =>
            (MEAL_TYPES as readonly string[]).includes(m)
          ),
          suitableDays: recipe.suitableDays ?? "any",
          freezable: recipe.freezable,
          ingredients: recipe.ingredients.map((ing) => ({
            name: ing.name,
            quantity: ing.quantity ?? "",
            units: ing.units ?? "",
            notes: ing.notes ?? "",
          })),
        }
      : {
          name: "",
          description: "",
          protein: "",
          mealTypes: ["dinner"],
          suitableDays: "any",
          freezable: false,
          ingredients: [],
        },
  });

  const selectedMealTypes = watch("mealTypes");
  const showSuitableDays = selectedMealTypes?.includes("breakfast");

  const { fields, append, remove } = useFieldArray({ control, name: "ingredients" });

  const mutationError = isEditing ? updateRecipe.error : createRecipe.error;
  const isPending = isEditing ? updateRecipe.isPending : createRecipe.isPending;

  async function onSubmit(data: RecipeFormData) {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      protein: data.protein || undefined,
      mealTypes: data.mealTypes,
      suitableDays: data.suitableDays,
      freezable: data.freezable,
      ingredients: data.ingredients
        .filter((i) => i.name.trim() !== "")
        .map((i) => ({ ...i, units: i.units || undefined })),
    };

    try {
      if (isEditing) {
        await updateRecipe.mutateAsync({ id: recipe.id, data: payload });
      } else {
        await createRecipe.mutateAsync(payload);
      }
      onSuccess();
    } catch {
      // error displayed via mutationError
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="Recipe Name"
        {...register("name")}
        error={errors.name?.message}
        placeholder="e.g. Spaghetti Bolognese"
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register("description")}
          rows={2}
          placeholder="Brief description..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <Input
        label="Main Protein"
        {...register("protein")}
        placeholder="e.g. chicken, beef, tofu"
        className="max-w-64"
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-gray-700">Meal Types</span>
        <div className="flex gap-4">
          {MEAL_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
              <input
                type="checkbox"
                value={type}
                {...register("mealTypes")}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="capitalize">{type}</span>
            </label>
          ))}
        </div>
        {errors.mealTypes && (
          <p className="text-xs text-red-600">{errors.mealTypes.message}</p>
        )}
      </div>

      {showSuitableDays && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Breakfast suitability</span>
          <div className="flex flex-col gap-1.5">
            {SUITABLE_DAYS_OPTIONS.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input
                  type="radio"
                  value={value}
                  {...register("suitableDays")}
                  className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
        <input
          type="checkbox"
          {...register("freezable")}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span>Can be frozen</span>
      </label>

      {/* Ingredients */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Ingredients</span>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => append({ name: "", quantity: "", units: "", notes: "" })}
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>

        {fields.length === 0 && (
          <p className="text-xs italic text-gray-400">No ingredients added yet.</p>
        )}

        {fields.length > 0 && (
          <div className="mb-1 grid grid-cols-[1fr_5rem_5.5rem_7rem_1.75rem] gap-2 text-xs font-medium text-gray-500">
            <span>Name</span>
            <span>Quantity</span>
            <span>Units</span>
            <span>Notes</span>
            <span />
          </div>
        )}

        <div className="flex flex-col gap-2">
          {fields.map((field, index) => {
            const ingError = errors.ingredients?.[index];
            return (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_5rem_5.5rem_7rem_1.75rem] items-start gap-2"
              >
                <div>
                  <input
                    {...register(`ingredients.${index}.name`)}
                    placeholder="e.g. Olive oil"
                    className={`w-full ${ingFieldClass} ${ingError?.name ? "border-red-400" : ""}`}
                  />
                  {ingError?.name && (
                    <p className="mt-0.5 text-xs text-red-600">{ingError.name.message}</p>
                  )}
                </div>
                <input
                  {...register(`ingredients.${index}.quantity`)}
                  placeholder="2"
                  className={`w-full ${ingFieldClass}`}
                />
                <select
                  {...register(`ingredients.${index}.units`)}
                  className={`w-full ${ingFieldClass}`}
                >
                  <option value="">—</option>
                  {UNITS.map((u) => (
                    <option key={u} value={u}>{u === "count" ? "count (no unit)" : u}</option>
                  ))}
                </select>
                <input
                  {...register(`ingredients.${index}.notes`)}
                  placeholder="optional"
                  className={`w-full ${ingFieldClass}`}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-0.5 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Remove ingredient"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {mutationError && <ErrorMessage error={mutationError} />}

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" loading={isPending}>
          {isEditing ? "Save Changes" : "Create Recipe"}
        </Button>
      </div>
    </form>
  );
}
