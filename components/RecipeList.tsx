import { Recipe } from "@/types/Recipe";
import { Trash2 } from "lucide-react";

export default function RecipeList({
  recipes,
  deleteRecipe,
}: {
  recipes: Recipe[];
  deleteRecipe: (number) => void;
}) {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {recipes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No recipes added yet. Click the + button to add your first recipe!
        </p>
      ) : (
        recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="border rounded-lg p-3 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-800">{recipe.name}</h3>
              <Trash2
                className="w-4 h-4 text-red-600 hover:text-red-800 cursor-pointer"
                onClick={() => deleteRecipe(recipe.id)}
              />
            </div>
            {recipe.ingredients && (
              <p className="text-sm text-gray-600 mt-1">
                <strong>Ingredients:</strong>{" "}
                {recipe.ingredients.slice(0, 1).join(", ")}...
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
