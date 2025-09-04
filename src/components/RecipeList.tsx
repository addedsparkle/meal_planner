import type { Recipe } from "../types/Recipe";
import { Trash2 } from "lucide-react";

export const RecipeList = ({
  recipes,
  deleteRecipe,
}: {
  recipes: Recipe[];
  deleteRecipe: (index: number) => void;
}) => {
  return (
    <div>
      {recipes.length === 0 ? (
        <p>
          No recipes added yet. Click the + button to add your first recipe!
        </p>
      ) : (
        recipes.map((recipe) => (
          <div key={recipe.id}>
            <div>
              <h3>{recipe.name}</h3>
              <Trash2
                onClick={() => {
                  deleteRecipe(recipe.id);
                }}
              />
            </div>
            <p>
              <strong>Ingredients:</strong>{" "}
              {recipe.ingredients.slice(0, 1).join(", ")}...
            </p>
          </div>
        ))
      )}
    </div>
  );
};
