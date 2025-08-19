import { Recipe } from "@/types/Recipe";
import { Download, Plus, Upload } from "lucide-react";
import { useState } from "react";

export default function RecipeManagement({
  addRecipe,
}: {
  addRecipe: (recipe: Recipe) => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    name: "",
    ingredients: [],
    instructions: "",
  });

  const onAddRecipe = () => {
    if (newRecipe.name.trim()) {
      addRecipe({ ...newRecipe, id: Date.now() });
      setNewRecipe({ name: "", ingredients: [], instructions: "" });
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">My Recipes</h2>
        <div className="flex gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={() => {}}
              className="hidden"
            />
            <Upload className="w-5 h-5 text-blue-600 hover:text-blue-800" />
          </label>
          <Download
            className="w-5 h-5 text-green-600 hover:text-green-800 cursor-pointer"
            onClick={() => {}}
          />
          <Plus
            className="w-6 h-6 text-blue-600 hover:text-blue-800 cursor-pointer"
            onClick={() => setShowAddForm(!showAddForm)}
          />
        </div>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Recipe name"
            value={newRecipe.name}
            onChange={(e) =>
              setNewRecipe({ ...newRecipe, name: e.target.value })
            }
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            placeholder="Ingredients (one per line)"
            value={newRecipe.ingredients}
            onChange={(e) =>
              setNewRecipe({
                ...newRecipe,
                ingredients: e.target.value.split("/n"),
              })
            }
            className="w-full p-2 mb-2 border rounded h-20"
          />
          <textarea
            placeholder="Instructions"
            value={newRecipe.instructions}
            onChange={(e) =>
              setNewRecipe({ ...newRecipe, instructions: e.target.value })
            }
            className="w-full p-2 mb-2 border rounded h-20"
          />
          <div className="flex gap-2">
            <button
              onClick={onAddRecipe}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Add Recipe
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
