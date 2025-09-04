import type { Recipe } from "../types/Recipe";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import {
  TextField,
  Label,
  Input,
  TextArea,
  DialogTrigger,
  Button,
  Dialog,
} from "react-aria-components";
import { Modal } from "./Modal";

export const AddRecipeForm = ({
  addRecipe,
}: {
  addRecipe: (recipe: Recipe) => void;
}) => {
  const [recipeName, setRecipeName] = useState<string>();
  const [ingredients, setIngredients] = useState<string[]>();

  const onAddRecipe = () => {
    if (recipeName?.trim() && ingredients) {
      addRecipe({ name: recipeName.trim(), ingredients, id: Date.now() });
      setIngredients(undefined);
      setRecipeName(undefined);
    }
  };
  return (
    <DialogTrigger>
      <Button>
        <PlusIcon />
      </Button>
      <Modal isDismissable>
        <Dialog className="p-5">
          <TextField>
            <Label>Recipe name</Label>

            <Input
              type="text"
              placeholder="Recipe name"
              value={recipeName}
              onChange={(e) => {
                setRecipeName(e.target.value);
              }}
              className="w-full p-2 mb-2 border rounded"
            />
          </TextField>
          <TextField>
            <Label>Ingredients</Label>
            <TextArea
              placeholder="Ingredients (one per line)"
              value={ingredients}
              onChange={(e) => {
                setIngredients(e.target.value.split("/n"));
              }}
              className="w-full p-2 mb-2 border rounded h-20"
            />
          </TextField>
          <Button
            slot="close"
            onClick={onAddRecipe}
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Recipe
          </Button>
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
};
