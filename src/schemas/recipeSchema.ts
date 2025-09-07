import * as yup from 'yup'

export const recipeSchema = yup.object({
  name: yup
    .string()
    .required('Recipe name is required')
    .min(2, 'Recipe name must be at least 2 characters')
    .max(100, 'Recipe name must be less than 100 characters'),
  
  description: yup
    .string()
    .optional()
    .max(500, 'Description must be less than 500 characters'),
  
  instructions: yup
    .string()
    .optional()
    .max(2000, 'Instructions must be less than 2000 characters'),
  
  prep_time: yup
    .number()
    .optional()
    .min(0, 'Prep time must be positive')
    .max(1440, 'Prep time must be less than 24 hours'),
  
  cook_time: yup
    .number()
    .optional()
    .min(0, 'Cook time must be positive')
    .max(1440, 'Cook time must be less than 24 hours'),
  
  servings: yup
    .number()
    .optional()
    .min(1, 'Servings must be at least 1')
    .max(50, 'Servings must be less than 50')
})

export type RecipeFormData = {
  name: string
  description?: string | undefined
  instructions: string | undefined
  prep_time: number  | undefined
  cook_time: number  | undefined
  servings: number | undefined
}