import { PlusIcon } from "lucide-react";
import {
  Input,
  TextArea,
  DialogTrigger,
  Button,
  Dialog,
} from "react-aria-components";
import { Modal } from "./Modal";
import { type RecipeFormData } from "../schemas/recipeSchema";
import { useCreateRecipe } from "../hooks/useRecipes";
import { useForm, type SubmitHandler, type SubmitErrorHandler } from "react-hook-form"

export const AddRecipeForm = () => {

  const {mutate} = useCreateRecipe()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<RecipeFormData>({});

  const onSubmit: SubmitHandler<RecipeFormData> = (data: RecipeFormData) => {
    try {
      const recipeData = {
        name: data.name,
        description: data.description ?? null,
        instructions: data.instructions ?? null,
        prep_time: data.prep_time ?? null,
        cook_time: data.cook_time ?? null,
        servings: data.servings ?? null,
      };
      mutate(recipeData);
      reset()
    } catch (error) {
      console.error('Failed to add recipe:', error);
    }
  };
  const onError: SubmitErrorHandler<RecipeFormData> = (errors) => {console.log(errors)}

  return (
    <DialogTrigger>
      <Button>
        <PlusIcon />
      </Button>
      <Modal isDismissable>
        <Dialog className="p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold text-emerald-800 mb-4">Add New Recipe</h2>
          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
            <Input {...register("name")} type="text"
                    placeholder="Enter recipe name"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />

            <TextArea
              {...register("description")} 
              placeholder="Brief description of the recipe"
              className="w-full p-2 border rounded h-20 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />

            <TextArea
              {...register("instructions")} 
              placeholder="Step-by-step cooking instructions"
              className="w-full p-2 border rounded h-32 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />


            <Input
              {...register("prep_time")}
              type="number"
              placeholder="30"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />

            <Input
              {...register("cook_time")}
              type="number"
              placeholder="45"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />

            <Input
              {...register("servings")}
              type="number"
              placeholder="4"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                isDisabled={isSubmitting}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Recipe'}
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
    </DialogTrigger>
  );
};
