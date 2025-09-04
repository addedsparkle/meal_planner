import type { Day } from "./Day";
import type { Recipe } from "./Recipe";

export type DayPlan = {
  day: Day;
  recipe: Recipe;
};

export type WeekPlan = DayPlan[];
