import { WeekPlan } from "@/types/WeekPlan"
import { RefreshCw } from "lucide-react";

export default function MealPlan({mealPlan, disableReplace, replaceRecipe} : {mealPlan: WeekPlan; disableReplace?: boolean; replaceRecipe: (index:number) => void}) {
    
    return <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="space-y-3">
                    {mealPlan.map((meal, index) => (
                        <div key={index} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded-r-lg">
                            <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-gray-700">{meal.day}</span>
                                <span className="text-green-700 font-medium">{meal.recipe.name}</span>
                            </div>
                            <button
                                onClick={() => replaceRecipe(index)}
                                disabled={disableReplace}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded disabled:text-gray-400 disabled:cursor-not-allowed"
                                title="Replace with different recipe"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            </div>
                        </div>
                    ))
                    }
                </div>

                {mealPlan.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Recipes This Week</h3>
                    <p className="text-sm text-gray-600">
                    You'll be cooking: {[...new Set(mealPlan.map(meal => meal.recipe.name))].join(', ')}
                    </p>
                </div>
                )}
          </div>
}