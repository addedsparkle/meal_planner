import { Snowflake, UtensilsCrossed } from "lucide-react";
import { Button } from "../ui/Button";
import type { Recipe } from "../../lib/types";

interface RecipeDetailProps {
  recipe: Recipe;
  onEdit: () => void;
  onClose: () => void;
}

export function RecipeDetail({ recipe, onEdit, onClose }: RecipeDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {recipe.protein && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-sm font-medium text-amber-800 capitalize">
            {recipe.protein}
          </span>
        )}
        {recipe.mealTypes.map((mt) => (
          <span key={mt} className="rounded-full bg-blue-100 px-2.5 py-1 text-sm font-medium text-blue-700 capitalize">
            {mt}
          </span>
        ))}
        {recipe.freezable && (
          <span className="flex items-center gap-1 rounded-full bg-cyan-100 px-2.5 py-1 text-sm font-medium text-cyan-700">
            <Snowflake className="h-3.5 w-3.5" />
            Freezable
          </span>
        )}
      </div>

      {recipe.description && (
        <p className="text-sm text-gray-700">{recipe.description}</p>
      )}

      {recipe.ingredients.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <UtensilsCrossed className="h-4 w-4 text-gray-400" />
            Ingredients
          </h3>
          <ul className="space-y-1.5">
            {recipe.ingredients.map((ing) => (
              <li key={ing.id} className="flex flex-wrap gap-1.5 text-sm">
                <span className="font-medium text-gray-800">{ing.name}</span>
                {(ing.quantity || ing.units) && (
                  <span className="text-gray-500">
                    &mdash;{ing.quantity && ` ${ing.quantity}`}{ing.units && ing.units !== "count" && ` ${ing.units}`}
                  </span>
                )}
                {ing.notes && (
                  <span className="italic text-gray-400">({ing.notes})</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onEdit}>Edit Recipe</Button>
      </div>
    </div>
  );
}
