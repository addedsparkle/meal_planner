import { PlusIcon, ChevronDown } from "lucide-react";
import {
  Input,
  TextArea,
  Button,
  Dialog,
  TextField,
  Label,
  Heading,
  ModalOverlay,
  Checkbox,
  FieldError,
  Select,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
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
import type { Protein } from "../types/Ingredient";
import type { MealType } from "../types/MealPlan";


const PROTEINS: Protein[] = ["Chicken", "Beef", "Pork", "Bean", "Egg"];
const MEAL_TYPES: MealType[] = ["Breakfast" , "Lunch" , "Dinner" , "Snack"];

export const AddRecipeForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate } = useCreateRecipe();
  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<RecipeFormData>({
    defaultValues: { ingredients: [], canBatch: false },
  });

  const onSubmit: SubmitHandler<RecipeFormData> = (data: RecipeFormData) => {
    try {
      console.log({data})
      mutate(data);
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
              className="space-y-4 flex flex-col grow"
            >
              <Heading
                className="text-xl font-semibold text-emerald-800 mb-4"
                slot="title"
              >
                Add New Recipe
              </Heading>
              <div className="flex flex-row gap-2 w-full grow ">
                <div className="flex flex-col grow ">
                  <Controller
                    control={control}
                    name="name"
                    rules={{ required: "Name is required." }}
                    render={({
                      field: { name, value, onChange, onBlur, ref },
                      fieldState: { invalid, error },
                    }) => (
                      <TextField
                        name={name}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        isRequired
                        validationBehavior="aria"
                        isInvalid={invalid}
                      >
                        <Label>Name</Label>
                        <Input
                          ref={ref}
                          className="w-full p-2 border rounded "
                        />
                        <FieldError>{error?.message}</FieldError>
                      </TextField>
                    )}
                  />
                  <div className="flex flex-col gap-2">
                    <Controller
                      control={control}
                      name="mainProtein"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onChange={(key) => {
                            field.onChange(key as Protein);
                          }}
                        >
                          <Label className="text-sm font-medium">Main Protein</Label>
                          <Button className="w-full p-2 border rounded flex items-center justify-between hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500">
                            <SelectValue  />
                            <ChevronDown size={16} />
                          </Button>
                          <Popover className="bg-white border rounded shadow-lg">
                            <ListBox className="outline-none">
                              {PROTEINS.map((protein) => (
                                <ListBoxItem
                                  key={protein}
                                  id={protein}
                                  className="px-4 py-2 cursor-pointer hover:bg-emerald-50 outline-none"
                                >
                                  {protein}
                                </ListBoxItem>
                              ))}
                            </ListBox>
                          </Popover>
                        </Select>
                      )}
                    />
                    <Controller
                      control={control}
                      name="meals"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          selectionMode="multiple"
                          onChange={(key) => {
                            field.onChange(key as MealType[]);
                          }}
                        >
                          <Label className="text-sm font-medium">Meals</Label>
                          <Button className="w-full p-2 border rounded flex items-center justify-between hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500">
                            <SelectValue  />
                            <ChevronDown size={16} />
                          </Button>
                          <Popover className="bg-white border rounded shadow-lg">
                            <ListBox className="outline-none">
                              {MEAL_TYPES.map((mealType: MealType) => (
                                <ListBoxItem
                                  key={mealType}
                                  id={mealType}
                                  className="px-4 py-2 cursor-pointer hover:bg-emerald-50 outline-none"
                                >
                                  {mealType}
                                </ListBoxItem>
                              ))}
                            </ListBox>
                          </Popover>
                        </Select>
                      )}
                    />
                    <Controller
                      control={control}
                      name="canBatch"
                      render={({ field }) => (
                        <Checkbox
                          isSelected={field.value}
                          onChange={field.onChange}
                          className="flex items-center gap-2"
                        >
                          <div className="w-5 h-5 border-2 border-gray-400 rounded flex items-center justify-center">
                            {field.value && (
                              <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <Label className="cursor-pointer">Can batch?</Label>
                        </Checkbox>
                      )}
                    />
                  </div>
                  <Controller
                    control={control}
                    name="instructions"
                    render={({
                      field: { name, value, onChange, onBlur, ref },
                      fieldState: { invalid, error },
                    }) => (
                      <TextField
                        className="grow"
                        name={name}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        validationBehavior="aria"
                        isInvalid={invalid}
                      >
                        <Label>Instructions</Label>
                        <TextArea
                          ref={ref}
                          placeholder="Step-by-step cooking instructions"
                          className="w-full p-2 border rounded"
                        />
                        <FieldError>{error?.message}</FieldError>
                      </TextField>
                    )}
                  />
                </div>
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
                  onClick={() => {
                    setIsOpen(false);
                  }}
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
