import { Day } from "./Day";
import { Recipe } from "./Recipe";

export type DayPlan = {
  day: Day;
  recipe: Recipe;
};

export type WeekPlan = DayPlan[];
