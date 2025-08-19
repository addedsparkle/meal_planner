import { Day } from "./Day";

export type Ingredient = {
  id: number;
  name: string;
  count: number;
  recipes: string[];
  days: Day[];
};
