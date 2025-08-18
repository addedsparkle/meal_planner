import { Ingredient } from "@/types/Ingredient";
import { WeekPlan } from "@/types/WeekPlan";

export default function generateShoppingList(mealPlanData: WeekPlan):Map<string, Ingredient> {
    const ingredientMap = new Map<string, Ingredient>();
    
    mealPlanData.forEach(meal => {
        if (meal.recipe.ingredients) {
            const ingredients = meal.recipe.ingredients
            .map(ingredient => ingredient.trim().toLowerCase())
            .filter(ingredient => ingredient.length > 0);
            
            ingredients.forEach(ingredient => {
            if (ingredientMap.has(ingredient)) {
                const existing = ingredientMap.get(ingredient);
                existing.count += 1;
                existing.recipes.push(meal.recipe.name);
                existing.days.push(meal.day);
            } else {
                ingredientMap.set(ingredient, {
                id: Date.now() + Math.random(),
                name: ingredient,
                count: 1,
                recipes: [meal.recipe.name],
                days: [meal.day]
                });
            }
            });
        }
    });
    return ingredientMap
}