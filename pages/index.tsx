import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import MealPlan from "@/components/MealPlan";
import { WeekPlan } from "@/types/WeekPlan";
import { generateMealPlan } from "@/lib/mealPlan";
import generateShoppingList from "@/lib/generateShoppingList";
import { Ingredient } from "@/types/Ingredient";
import ShoppingList from "@/components/ShoppingList";
import GenerateButton from "@/components/GenerateButton";
import RecipeList from "@/components/RecipeList";
import RecipeManagement from "@/components/RecipeManagement";
import { Recipe } from "@/types/Recipe";

export default function Home() {
  const [mealPlan, setMealPlan] = useState<WeekPlan>([]);
  const [recipes, setRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState(
    new Map<string, Ingredient>(),
  );

  const onGenerateClick = () => {
    const mealPlan = generateMealPlan(recipes);
    const shoppingList = generateShoppingList(mealPlan);
    setMealPlan(mealPlan);
    setShoppingList(shoppingList);
  };

  const removeFromShoppingList = (itemId) => {
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
    <div className="container">
      <Head>
        <title>Next.js Starter!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="Welcome to my app!" />
        <RecipeManagement
          addRecipe={(recipe: Recipe) =>
            setRecipes((prev) => [...prev, recipe])
          }
        />
        <div className="bg-white rounded-lg shadow-lg p-6">
          <RecipeList recipes={recipes} deleteRecipe={deleteRecipe} />
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Weekly Meal Plan
            </h2>
            <GenerateButton
              generateMealPlan={onGenerateClick}
              disabled={false}
            />
          </div>
          <MealPlan
            mealPlan={mealPlan}
            replaceRecipe={function (index: number): void {
              throw new Error("Function not implemented.");
            }}
          />
        </div>
        <ShoppingList
          shoppingList={shoppingList}
          removeFromShoppingList={removeFromShoppingList}
        />
      </main>

      <Footer />
    </div>
  );
}
