import { PlusIcon } from "lucide-react";
import {
  Input,
  TextArea,
  Button,
  Dialog,
  TextField,
  Label,
  Heading,
  ModalOverlay,
} from "react-aria-components";
import { FullPageModal } from "./Modal";
import { type RecipeFormData } from "../schemas/recipeSchema";
import { useCreateRecipe } from "../hooks/useRecipes";
import {
  useForm,
  type SubmitHandler,
  type SubmitErrorHandler,
  Controller,
} from "react-hook-form";
import { useState } from "react";
import { IngredientSelect } from "./IngredientSelect";

export const AddRecipeForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate } = useCreateRecipe();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<RecipeFormData>({defaultValues:{ingredients:[]}});

  const onSubmit: SubmitHandler<RecipeFormData> = (data: RecipeFormData) => {
    try {
      const recipeData = {
        name: data.name,
        instructions: data.instructions ?? null,
        canBatch: false,
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
        <FullPageModal>
          <Dialog className="p-6 w-full  max-h-[85dvh] overflow-scroll scroll-smooth">
            <form
              onSubmit={handleSubmit(onSubmit, onError)}
              className="space-y-4 flex flex-col"
            >
              <Heading
                className="text-xl font-semibold text-emerald-800 mb-4"
                slot="title"
              >
                Add New Recipe
              </Heading>
              <div className="flex flex-row gap-2 w-full grow ">
                <div className="flex flex-col grow ">
              <TextField>
                <Label>Name</Label>
                <Input
                  {...register("name")}
                  type="text"
                  placeholder="Enter recipe name"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </TextField>

              <TextField className="grow">
                <Label>Instructions</Label>
                <TextArea
                  {...register("instructions")}
                  placeholder="Step-by-step cooking instructions"
                  className="w-full p-2 border rounded h-full focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </TextField></div>
              <div className="flex grow">
              <Controller
                control={control}
                name="ingredients"
                render={({ field }) => <IngredientSelect {...field} />}
                />
                </div>
              </div>
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
                  onClick={() => {setIsOpen(false)}}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Dialog>
        </FullPageModal>
      </ModalOverlay>
    </div>
  );
};
