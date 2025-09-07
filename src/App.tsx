import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AddRecipeForm } from "./components/AddRecipeForm";
import type { Recipe } from "./types/Recipe";
import { RecipeList } from "./components/RecipeList";
import { GenerateButton } from "./components/GenerateButton";
import { MealPlan } from "./components/MealPlan";
import type { WeekPlan } from "./types/WeekPlan";
import { generateMealPlan, getReplacementMeal } from "./lib/mealPlan";
import { FileUploader } from "./components/FileUploader";
import { createRecipeDownloadUrl } from "./lib/exportRecipes";
import { Button } from "react-aria-components";
import { DownloadIcon } from "lucide-react";
import { useRecipes } from "./hooks/useRecipes";

const queryClient = new QueryClient();

function AppContent() {
  const { data: recipes = [], isLoading, error } = useRecipes();

  const [mealPlan, setMealPlan] = useState<WeekPlan>([]);


  const onGenerateClick = () => {
    const mealPlan = generateMealPlan(recipes);
    setMealPlan(mealPlan);
  };

  const replaceRecipe = (index: number) => {
    const newMealPlan = getReplacementMeal(index, mealPlan, recipes);
    setMealPlan(newMealPlan);
  };


  if (isLoading) {
    return <div className="bg-gray-100 h-screen p-10 flex justify-center items-center">
      <div className="text-2xl text-emerald-800">Loading recipes...</div>
    </div>;
  }

  if (error) {
    return <div className="bg-gray-100 h-screen p-10 flex justify-center items-center">
      <div className="text-2xl text-red-600">Error loading recipes: {error.message}</div>
    </div>;
  }

  return (
      <div className="bg-gray-100 h-screen p-10 flex gap-4 flex-col">
        <div className="bg-white border rounded border-gray-400 p-6 min-h-20">
          <h1 className="text-5xl text-emerald-800">Sparkle Meal Planner</h1>
        </div>
        <div className="bg-white border rounded p-6  border-gray-400 flex flex-col gap-2">
          <div className="flex-1 flex flex-row justify-between items-end">
            <h2 className="text-2xl text-emerald-800">Recipes</h2>
            <div className="flex gap-2">
              <FileUploader addRecipes={ (recipes: Recipe[]) => {console.log(recipes);}} />
              <Button onClick={() => {
                const url = createRecipeDownloadUrl(recipes)
                const link = document.createElement('a')
                link.href = url
                link.download = 'recipes.json'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
              }}
              >
                <DownloadIcon />
              </Button>
              <AddRecipeForm />
            </div>
          </div>
          <RecipeList recipes={recipes} />
        </div>
        <div className="bg-white border rounded p-6  border-gray-400 flex flex-col gap-2">
          <div className="flex-1 flex flex-row justify-between items-end">
            <h2 className="text-2xl  text-emerald-800">Weekly Meal Plan</h2>
            <GenerateButton generateMealPlan={onGenerateClick} disabled={false} />
          </div>
          <MealPlan mealPlan={mealPlan} replaceRecipe={replaceRecipe} />
        </div>
      </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
