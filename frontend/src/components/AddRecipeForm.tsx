import { ChevronDown, PlusIcon } from "lucide-react";
import {
  Input,
  TextArea,
  Button,
  Dialog,
  TextField,
  Label,
  Heading,
  ModalOverlay,
  Select,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
} from "react-aria-components";
import { Modal } from "./Modal";
import { type RecipeFormData } from "../schemas/recipeSchema";
import { useCreateRecipe } from "../hooks/useRecipes";
import {
  useForm,
  type SubmitHandler,
  type SubmitErrorHandler,
} from "react-hook-form";
import { useState } from "react";
import { useIngredients } from "../hooks/useIngredients";

export const AddRecipeForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate } = useCreateRecipe();
  const { data: ingredients } = useIngredients();
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<RecipeFormData>({});

  const onSubmit: SubmitHandler<RecipeFormData> = (data: RecipeFormData) => {
    try {
      const recipeData = {
        name: data.name,
        instructions: data.instructions ?? null,
      };
      mutate(recipeData);
      reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to add recipe:", error);
    }
  };
  const onError: SubmitErrorHandler<RecipeFormData> = (errors) => {
    console.log(errors);
  };

  return (
    <div>
      <Button
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <PlusIcon />
      </Button>
      <ModalOverlay isDismissable isOpen={isOpen}>
        <Modal>
          <Dialog className="p-6 w-full max-w-md">
            <form
              onSubmit={handleSubmit(onSubmit, onError)}
              className="space-y-4"
            >
              <Heading
                className="text-xl font-semibold text-emerald-800 mb-4"
                slot="title"
              >
                Add New Recipe
              </Heading>
              <TextField>
                <Label>Name</Label>
                <Input
                  {...register("name")}
                  type="text"
                  placeholder="Enter recipe name"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </TextField>

              <TextField>
                <Label>Instructions</Label>
                <TextArea
                  {...register("instructions")}
                  placeholder="Step-by-step cooking instructions"
                  className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </TextField>

              <Heading>Ingredients</Heading>
              <Select>
                <Button>
                  <SelectValue />
                  <span aria-hidden="true">
                    <ChevronDown size={16} />
                  </span>
                </Button>
                <Popover>
                  <ListBox>
                    {ingredients &&
                      ingredients.map((ingredient) => (
                        <ListBoxItem>{ingredient.name}</ListBoxItem>
                      ))}
                    <ListBoxItem>Add New</ListBoxItem>
                  </ListBox>
                </Popover>
              </Select>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  isDisabled={isSubmitting}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add Recipe"}
                </Button>
                <Button
                  slot="close"
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  );
};
