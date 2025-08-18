import {Recipe} from "@/types/Recipe";
import { WeekPlan } from "@/types/WeekPlan";


export const generateMealPlan = (recipes: Recipe[]): WeekPlan => {
    if (recipes.length === 0) return [];
    
    const shuffled = [...recipes].sort(() => Math.random() - 0.5);
    const weekPlan = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (let i = 0; i < 7; i++) {
      weekPlan.push({
        day: days[i],
        recipe: shuffled[i % shuffled.length]
      });
    }
    
    return weekPlan
  };