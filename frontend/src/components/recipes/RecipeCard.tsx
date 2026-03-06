import { Snowflake, UtensilsCrossed } from "lucide-react";
import { Card, CardBody, CardFooter } from "../ui/Card";
import { Button } from "../ui/Button";
import type { Recipe } from "../../lib/types";

interface RecipeCardProps {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
  deleting?: boolean;
}

function formatLastUsed(lastUsedAt: string | null): string {
  if (!lastUsedAt) return "Never used";
  const diffDays = Math.floor(
    (Date.now() - new Date(lastUsedAt + "T00:00:00").getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Used today";
  if (diffDays === 1) return "Used yesterday";
  if (diffDays < 7) return `Used ${diffDays} days ago`;
  if (diffDays < 30) return `Used ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? "s" : ""} ago`;
  return `Used ${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? "s" : ""} ago`;
}

export function RecipeCard({ recipe, onView, onEdit, onDelete, deleting }: RecipeCardProps) {
  return (
    <Card className="flex flex-col">
      <CardBody className="flex-1">
        <h3
          className="cursor-pointer font-semibold text-gray-900 line-clamp-1 hover:text-blue-600"
          onClick={() => onView(recipe)}
        >
          {recipe.name}
        </h3>

        {recipe.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{recipe.description}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {recipe.protein && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 capitalize">
              {recipe.protein}
            </span>
          )}
          {recipe.mealTypes.map((mt) => (
            <span key={mt} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 capitalize">
              {mt}
            </span>
          ))}
          {recipe.mealTypes.includes("breakfast") && recipe.suitableDays !== "any" && (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 capitalize">
              {recipe.suitableDays === "weekday" ? "Weekdays" : "Weekends"}
            </span>
          )}
          {recipe.freezable && (
            <span className="flex items-center gap-0.5 rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-700">
              <Snowflake className="h-3 w-3" />
              Freezable
            </span>
          )}
          {recipe.ingredients.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <UtensilsCrossed className="h-3.5 w-3.5" />
              {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-400">
          {formatLastUsed(recipe.lastUsedAt)}
        </p>
      </CardBody>

      <CardFooter className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => onView(recipe)}>
          View
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onEdit(recipe)}>
          Edit
        </Button>
        <Button size="sm" variant="danger" onClick={() => onDelete(recipe)} loading={deleting}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
