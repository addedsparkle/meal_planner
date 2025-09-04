import { useState } from "react";
import { AddRecipeForm } from "./components/AddRecipeForm";
import type { Recipe } from "./types/Recipe";
import { RecipeList } from "./components/RecipeList";
import { GenerateButton } from "./components/GenerateButton";
import { MealPlan } from "./components/MealPlan";
import { ShoppingList } from "./components/ShoppingList";
import type { Ingredient } from "./types/Ingredient";
import type { WeekPlan } from "./types/WeekPlan";
import { generateMealPlan, getReplacementMeal } from "./lib/mealPlan";
import generateShoppingList from "./lib/generateShoppingList";

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const [mealPlan, setMealPlan] = useState<WeekPlan>([]);
  const [shoppingList, setShoppingList] = useState(
    new Map<string, Ingredient>(),
  );

  const onGenerateClick = () => {
    const mealPlan = generateMealPlan(recipes);
    const shoppingList = generateShoppingList(mealPlan);
    setMealPlan(mealPlan);
    setShoppingList(shoppingList);
  };

  const replaceRecipe = (index: number) => {
    const newMealPlan = getReplacementMeal(index, mealPlan, recipes);
    setMealPlan(newMealPlan);
    setShoppingList(generateShoppingList(newMealPlan));
  };

  const removeFromShoppingList = (itemId: string) => {
    setShoppingList((prev) => {
      const newList = new Map(prev);
      newList.delete(itemId);
      return newList;
    });
  };

  const deleteRecipe = (id: number) => {
    setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
  };

  return (
    <div className="bg-gray-100 h-screen p-10 flex gap-4 flex-col">
      <div className="bg-white border rounded border-gray-400 p-6 min-h-20">
        <h1 className="text-5xl text-emerald-800">Sparkle Meal Planner</h1>
      </div>
      <div className="bg-white border rounded p-6  border-gray-400 flex flex-col gap-2">
        <div className="flex-1 flex flex-row justify-between items-end">
          <h2 className="text-2xl text-emerald-800">Recipes</h2>
          <div>
            <AddRecipeForm
              addRecipe={(recipe: Recipe) => {
                setRecipes((prev) => [...prev, recipe]);
              }}
            />
          </div>
        </div>
        <RecipeList recipes={recipes} deleteRecipe={deleteRecipe} />
      </div>
      <div className="bg-white border rounded p-6  border-gray-400 flex flex-col gap-2">
        <div className="flex-1 flex flex-row justify-between items-end">
          <h2 className="text-2xl  text-emerald-800">Weekly Meal Plan</h2>
          <GenerateButton generateMealPlan={onGenerateClick} disabled={false} />
        </div>
        <MealPlan mealPlan={mealPlan} replaceRecipe={replaceRecipe} />
      </div>
      <div className="bg-white border rounded p-6 border-gray-400">
        <ShoppingList
          shoppingList={shoppingList}
          removeFromShoppingList={removeFromShoppingList}
        />
      </div>
    </div>
  );
}

export default App;
