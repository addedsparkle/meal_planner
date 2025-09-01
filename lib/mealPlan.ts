import { Recipe } from "@/types/Recipe";
import { WeekPlan } from "@/types/WeekPlan";

export const generateMealPlan = (recipes: Recipe[]): WeekPlan => {
  if (recipes.length === 0) return [];

  const shuffled = [...recipes].sort(() => Math.random() - 0.5);
  const weekPlan = [];
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  for (let i = 0; i < 7; i++) {
    weekPlan.push({
      day: days[i],
      recipe: shuffled[i % shuffled.length],
    });
  }

  return weekPlan;
};

export const getReplacementMeal = (
  index: number,
  weekPlan: WeekPlan,
  recipes: Recipe[],
): WeekPlan => {
  if (recipes.length === 0) return [];

  const shuffled = [...recipes].sort(() => Math.random() - 0.5);

  for (let i = 0; i < recipes.length; i++) {
    const candidate = shuffled[i % shuffled.length];
    if (weekPlan.findIndex((meal) => meal.recipe.id === candidate.id) < 0) {
      weekPlan[index].recipe = candidate;
      break;
    }
  }

  return weekPlan;
};
