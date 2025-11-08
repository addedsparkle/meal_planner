import { useState } from "react";
import {
  Button,
  TextField,
  Label,
  Input,
  Select,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
} from "react-aria-components";
import { PlusIcon, Trash2Icon, ChevronDown } from "lucide-react";
import type { RecipeIngredientIn, Unit } from "../types/Ingredient";

const UNITS: Unit[] = ["g", "ml", "pieces", "cup", "tbsp", "tsp"];

interface Props {
  value: RecipeIngredientIn[];
  onChange: (value: RecipeIngredientIn[]) => void;
  disabled?: boolean;
}

export const IngredientSelect = ({ value, onChange, disabled }: Props) => {
  const [newIngredient, setNewIngredient] = useState<RecipeIngredientIn>({
    name: "",
    amount: 0,
    unit: "pieces",
  });

  const handleAddIngredient = () => {
    if (newIngredient.name.trim() && newIngredient.amount > 0) {
      onChange([...value, newIngredient]);
      setNewIngredient({ name: "", amount: 0, unit: "pieces" });
    }
  };

  const handleRemoveIngredient = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  return (
    <div className="space-y-4">
      <Label>Ingredients</Label>
      {/* List of added ingredients */}
      {value.length > 0 && (
        <div className="space-y-1">
          <Label className="text-sm font-medium">Added Ingredients</Label>
          <div className="border rounded-md divide-y">
            {value.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-1 hover:bg-gray-50"
              >
                <div className="flex-1">
                  <span className="font-medium">{ingredient.name}</span>
                  <span className="text-gray-600 ml-2">
                    {ingredient.amount} {ingredient.unit}
                  </span>
                </div>
                <Button
                  onPress={() => {handleRemoveIngredient(index)}}
                  isDisabled={disabled}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2Icon size={18} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded-md p-4 space-y-3">
        
        <TextField>
          <Label className="text-xs text-gray-600">Ingredient Name</Label>
          <Input
            value={newIngredient.name}
            onChange={(e) =>
              {setNewIngredient({ ...newIngredient, name: e.target.value })}
            }
            onKeyUp={handleKeyPress}
            placeholder="e.g., Chicken Breast"
            disabled={disabled}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </TextField>

        <div className="grid grid-cols-2 gap-3">
          <TextField>
            <Label className="text-xs text-gray-600">Amount</Label>
            <Input
              type="number"
              value={newIngredient.amount || ""}
              onChange={(e) =>
                {setNewIngredient({
                  ...newIngredient,
                  amount: parseFloat(e.target.value) || 0,
                })}
              }
              onKeyUp={handleKeyPress}
              placeholder="200"
              disabled={disabled}
              min="0"
              step="0.1"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </TextField>

          <Select
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            selectedKey={newIngredient.unit}
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            onSelectionChange={(key) =>
              {setNewIngredient({ ...newIngredient, unit: key as Unit })}
            }
            isDisabled={disabled}
          >
            <Label className="text-xs text-gray-600">Unit</Label>
            <Button className="w-full p-2 border rounded flex items-center justify-between hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500">
              <SelectValue />
              <ChevronDown size={16} />
            </Button>
            <Popover className="bg-white border rounded shadow-lg">
              <ListBox className="outline-none">
                {UNITS.map((unit) => (
                  <ListBoxItem
                    key={unit}
                    id={unit}
                    className="px-4 py-2 cursor-pointer hover:bg-emerald-50 outline-none"
                  >
                    {unit}
                  </ListBoxItem>
                ))}
              </ListBox>
            </Popover>
          </Select>
        </div>

        <Button
          onPress={handleAddIngredient}
          isDisabled={disabled || !newIngredient.name.trim() || newIngredient.amount <= 0}
          className="w-full bg-emerald-600 text-white py-2 px-4 rounded hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <PlusIcon size={18} />
          Add Ingredient
        </Button>
      </div>
    </div>
  );
};