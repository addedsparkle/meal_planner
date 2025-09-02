import { Recipe } from "@/types/Recipe";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import {
  TextField,
  Label,
  Input,
  TextArea,
  DialogTrigger,
  Button,
  Modal,
  Dialog,
} from "react-aria-components";

export const AddRecipeForm = ({
  addRecipe,
}: {
  addRecipe: (recipe: Recipe) => void;
}) => {
  const [newRecipe, setNewRecipe] = useState({
    name: "",
    ingredients: [],
  });

  const onAddRecipe = () => {
    if (newRecipe.name.trim()) {
      addRecipe({ ...newRecipe, id: Date.now() });
      setNewRecipe({ name: "", ingredients: [] });
    }
  };
  return (
    <DialogTrigger>
      <Button>
        <PlusIcon />
      </Button>
      <Modal isDismissable>
        <Dialog>
          <TextField>
            <Label>Recipe name</Label>

            <Input
              type="text"
              placeholder="Recipe name"
              value={newRecipe.name}
              onChange={(e) =>
                setNewRecipe({ ...newRecipe, name: e.target.value })
              }
              className="w-full p-2 mb-2 border rounded"
            />
          </TextField>
          <TextField>
            <Label>Ingredients</Label>
            <TextArea
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
          </TextField>
          <Button
            slot="close"
            onClick={onAddRecipe}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Recipe
          </Button>
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
};
