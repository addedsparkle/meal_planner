import { test } from 'node:test'
import assert from 'node:assert'
import { build } from '../../helper.ts'

test('GET /api/meal-plans - get all meal plans', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'GET',
    url: '/api/meal-plans'
  })

  assert.equal(res.statusCode, 200)
  assert.ok(Array.isArray(JSON.parse(res.payload)))
})

test('POST /api/meal-plans - create a new meal plan', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/api/meal-plans',
    payload: {
      name: 'Test Meal Plan',
      startDate: new Date('2024-01-01').toISOString(),
      endDate: new Date('2024-01-07').toISOString()
    }
  })

  assert.equal(res.statusCode, 201)
  const mealPlan = JSON.parse(res.payload)
  assert.equal(mealPlan.name, 'Test Meal Plan')
  assert.ok(mealPlan.id)
})

test('POST /api/meal-plans - create a meal plan with snack', async (t) => {
  const app = await build(t)

  // Create a recipe to use as snack
  const recipeRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Test Snack Recipe',
      meal: 'Snack',
      mainProtein: 'Chicken'
    }
  })
  const recipe = JSON.parse(recipeRes.payload)

  const res = await app.inject({
    method: 'POST',
    url: '/api/meal-plans',
    payload: {
      name: 'Test Meal Plan with Snack',
      startDate: new Date('2024-01-01').toISOString(),
      endDate: new Date('2024-01-07').toISOString(),
      snack: recipe.id
    }
  })

  assert.equal(res.statusCode, 201)
  const mealPlan = JSON.parse(res.payload)
  assert.equal(mealPlan.name, 'Test Meal Plan with Snack')
  assert.equal(mealPlan.snack, recipe.id)
  assert.ok(mealPlan.id)
})

test('POST /api/meal-plans - should fail without required fields', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/api/meal-plans',
    payload: {
      name: 'Incomplete Plan'
      // Missing startDate (required field)
    }
  })

  assert.equal(res.statusCode, 400)
})

test('GET /api/meal-plans/current - get current meal plan', async (t) => {
  const app = await build(t)

  // Create a meal plan that includes today
  const today = new Date()
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

  await app.inject({
    method: 'POST',
    url: '/api/meal-plans',
    payload: {
      name: 'Current Week Plan',
      startDate: weekAgo.toISOString(),
      endDate: weekFromNow.toISOString()
    }
  })

  const res = await app.inject({
    method: 'GET',
    url: '/api/meal-plans/current'
  })

  assert.equal(res.statusCode, 200)
  const currentPlan = JSON.parse(res.payload)
  assert.equal(currentPlan.name, 'Current Week Plan')
})

test('GET /api/meal-plans/:id - get a specific meal plan', async (t) => {
  const app = await build(t)

  // Create a meal plan
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/meal-plans',
    payload: {
      name: 'Specific Meal Plan',
      startDate: new Date('2024-02-01').toISOString()
    }
  })
  const createdPlan = JSON.parse(createRes.payload)

  // Get the meal plan
  const res = await app.inject({
    method: 'GET',
    url: `/api/meal-plans/${createdPlan.id}`
  })

  assert.equal(res.statusCode, 200)
  const mealPlan = JSON.parse(res.payload)
  assert.equal(mealPlan.id, createdPlan.id)
  assert.equal(mealPlan.name, 'Specific Meal Plan')
  assert.ok(Array.isArray(mealPlan.recipes))
})

test('GET /api/meal-plans/:id - should return 404 for non-existent plan', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'GET',
    url: '/api/meal-plans/99999'
  })

  assert.equal(res.statusCode, 404)
  const error = JSON.parse(res.payload)
  assert.ok(error.error)
})

test('PUT /api/meal-plans/:id - update a meal plan', async (t) => {
  const app = await build(t)

  // Create recipes
  const recipe1Res = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Original Snack',
      meal: 'Snack',
      mainProtein: 'Pork'
    }
  })
  const recipe1 = JSON.parse(recipe1Res.payload)

  const recipe2Res = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Updated Snack',
      meal: 'Snack',
      mainProtein: 'Beef'
    }
  })
  const recipe2 = JSON.parse(recipe2Res.payload)

  // Create a meal plan
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/meal-plans',
    payload: {
      name: 'Original Name',
      startDate: new Date('2024-03-01').toISOString(),
      snack: recipe1.id
    }
  })
  const createdPlan = JSON.parse(createRes.payload)

  // Update the meal plan
  const res = await app.inject({
    method: 'PUT',
    url: `/api/meal-plans/${createdPlan.id}`,
    payload: {
      name: 'Updated Name',
      snack: recipe2.id
    }
  })

  assert.equal(res.statusCode, 200)
  const updatedPlan = JSON.parse(res.payload)
  assert.equal(updatedPlan.name, 'Updated Name')
  assert.equal(updatedPlan.snack, recipe2.id)
})

test('DELETE /api/meal-plans/:id - delete a meal plan', async (t) => {
  const app = await build(t)

  // Create a meal plan
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/meal-plans',
    payload: {
      name: 'To Be Deleted',
      startDate: new Date('2024-04-01').toISOString()
    }
  })
  const createdPlan = JSON.parse(createRes.payload)

  // Delete the meal plan
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/meal-plans/${createdPlan.id}`
  })

  assert.equal(res.statusCode, 204)

  // Verify it's deleted
  const getRes = await app.inject({
    method: 'GET',
    url: `/api/meal-plans/${createdPlan.id}`
  })
  assert.equal(getRes.statusCode, 404)
})

test('POST /api/meal-plans/:id/recipes - add a recipe to a meal plan', async (t) => {
  const app = await build(t)

  // Create a recipe
  const dinnerRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Monday Dinner',
      meal: 'Dinner',
      mainProtein: 'Chicken'
    }
  })
  const dinner = JSON.parse(dinnerRes.payload)

  // Create a meal plan
  const planRes = await app.inject({
    method: 'POST',
    url: '/api/meal-plans',
    payload: {
      name: 'Recipe Test Plan',
      startDate: new Date('2024-05-01').toISOString()
    }
  })
  const plan = JSON.parse(planRes.payload)

  // Add recipe to the plan
  const res = await app.inject({
    method: 'POST',
    url: `/api/meal-plans/${plan.id}/recipes`,
    payload: {
      recipeId: dinner.id,
      day: 'Monday',
      mealType: 'Dinner'
    }
  })

  assert.equal(res.statusCode, 201)
  const assignment = JSON.parse(res.payload)
  assert.equal(assignment.planId, plan.id)
  assert.equal(assignment.recipeId, dinner.id)
  assert.equal(assignment.day, 'Monday')
  assert.equal(assignment.mealType, 'Dinner')
})

test('DELETE /api/meal-plans/:id/recipes - remove a recipe from a meal plan', async (t) => {
  const app = await build(t)

  // Create recipes

  const recipeRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Recipe to Remove',
      meal: 'Lunch',
      mainProtein: 'Pork'
    }
  })
  const recipe = JSON.parse(recipeRes.payload)

  // Create meal plan and add recipe
  const planRes = await app.inject({
    method: 'POST',
    url: '/api/meal-plans',
    payload: {
      name: 'Delete Recipe Test Plan',
      startDate: new Date('2024-06-01').toISOString(),
      
    }
  })
  const plan = JSON.parse(planRes.payload)

  await app.inject({
    method: 'POST',
    url: `/api/meal-plans/${plan.id}/recipes`,
    payload: {
      recipeId: recipe.id,
      day: 'Tuesday',
      mealType: 'Lunch'
    }
  })

  // Remove the recipe
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/meal-plans/${plan.id}/recipes?recipeId=${recipe.id}&day=Tuesday`
  })

  assert.equal(res.statusCode, 204)

  // Verify it's removed
  const dayRes = await app.inject({
    method: 'GET',
    url: `/api/meal-plans/${plan.id}/days/Tuesday`
  })
  const recipes = JSON.parse(dayRes.payload)
  assert.equal(recipes.length, 0)
})

test('PUT /api/meal-plans/:id/recipes - update a recipe in a meal plan', async (t) => {
  const app = await build(t)

  // Create recipes

  const oldRecipeRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Old Recipe',
      meal: 'Breakfast',
      mainProtein: 'Egg'
    }
  })
  const oldRecipe = JSON.parse(oldRecipeRes.payload)

  const newRecipeRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'New Recipe',
      meal: 'Breakfast',
      mainProtein: 'Chicken'
    }
  })
  const newRecipe = JSON.parse(newRecipeRes.payload)

  // Create meal plan and add recipe
  const planRes = await app.inject({
    method: 'POST',
    url: '/api/meal-plans',
    payload: {
      name: 'Update Recipe Test Plan',
      startDate: new Date('2024-07-01').toISOString(),
      
    }
  })
  const plan = JSON.parse(planRes.payload)

  await app.inject({
    method: 'POST',
    url: `/api/meal-plans/${plan.id}/recipes`,
    payload: {
      recipeId: oldRecipe.id,
      day: 'Wednesday',
      mealType: 'Breakfast'
    }
  })

  // Update the recipe
  const res = await app.inject({
    method: 'PUT',
    url: `/api/meal-plans/${plan.id}/recipes`,
    payload: {
      oldRecipeId: oldRecipe.id,
      day: 'Wednesday',
      newRecipeId: newRecipe.id,
      mealType: 'Breakfast'
    }
  })

  assert.equal(res.statusCode, 200)
  const updated = JSON.parse(res.payload)
  assert.equal(updated.recipeId, newRecipe.id)
  assert.equal(updated.day, 'Wednesday')
})

test('GET /api/meal-plans/:id/days/:day - get recipes for a specific day', async (t) => {
  const app = await build(t)

  // Create recipes

  const breakfastRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Thursday Breakfast',
      meal: 'Breakfast',
      mainProtein: 'Egg'
    }
  })
  const breakfast = JSON.parse(breakfastRes.payload)

  const lunchRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Thursday Lunch',
      meal: 'Lunch',
      mainProtein: 'Chicken'
    }
  })
  const lunch = JSON.parse(lunchRes.payload)

  // Create meal plan
  const planRes = await app.inject({
    method: 'POST',
    url: '/api/meal-plans',
    payload: {
      name: 'Day Query Test Plan',
      startDate: new Date('2024-08-01').toISOString(),
      
    }
  })
  const plan = JSON.parse(planRes.payload)

  // Add recipes for Thursday
  await app.inject({
    method: 'POST',
    url: `/api/meal-plans/${plan.id}/recipes`,
    payload: {
      recipeId: parseInt(breakfast.id),
      day: 'Thursday',
      mealType: 'Breakfast'
    }
  })

  await app.inject({
    method: 'POST',
    url: `/api/meal-plans/${plan.id}/recipes`,
    payload: {
      recipeId: parseInt(lunch.id),
      day: 'Thursday',
      mealType: 'Lunch'
    }
  })

  // Get Thursday's recipes
  const res = await app.inject({
    method: 'GET',
    url: `/api/meal-plans/${plan.id}/days/Thursday`
  })

  assert.equal(res.statusCode, 200)
  const recipes = JSON.parse(res.payload)
  assert.equal(recipes.length, 2)
  assert.ok(recipes.some((r: { recipeId: number }) => r.recipeId === parseInt(breakfast.id)))
  assert.ok(recipes.some((r: { recipeId: number }) => r.recipeId === parseInt(lunch.id)))
})

test('PUT /api/meal-plans/:id/days/:day - update all recipes for a day', async (t) => {
  const app = await build(t)

  // Create recipes

  const recipe1Res = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Friday Recipe 1',
      meal: 'Breakfast',
      mainProtein: 'Egg'
    }
  })
  const recipe1 = JSON.parse(recipe1Res.payload)

  const recipe2Res = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Friday Recipe 2',
      meal: 'Dinner',
      mainProtein: 'Beef'
    }
  })
  const recipe2 = JSON.parse(recipe2Res.payload)

  // Create meal plan
  const planRes = await app.inject({
    method: 'POST',
    url: '/api/meal-plans',
    payload: {
      name: 'Day Update Test Plan',
      startDate: new Date('2024-09-01').toISOString(),
      
    }
  })
  const plan = JSON.parse(planRes.payload)

  // Update Friday with multiple recipes
  const res = await app.inject({
    method: 'PUT',
    url: `/api/meal-plans/${plan.id}/days/Friday`,
    payload: {
      recipes: [
        { recipeId: recipe1.id, mealType: 'Breakfast' },
        { recipeId: recipe2.id, mealType: 'Dinner' }
      ]
    }
  })

  assert.equal(res.statusCode, 200)
  const results = JSON.parse(res.payload)
  assert.equal(results.length, 2)

  // Verify the day has the correct recipes
  const dayRes = await app.inject({
    method: 'GET',
    url: `/api/meal-plans/${plan.id}/days/Friday`
  })
  const dayRecipes = JSON.parse(dayRes.payload)
  assert.equal(dayRecipes.length, 2)
})

test('Complete meal plan workflow', async (t) => {
  const app = await build(t)

  // Create multiple recipes

  const breakfastRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Scrambled Eggs',
      meal: 'Breakfast',
      mainProtein: 'Egg'
    }
  })
  const breakfast = JSON.parse(breakfastRes.payload)

  const lunchRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Chicken Salad',
      meal: 'Lunch',
      mainProtein: 'Chicken'
    }
  })
  const lunch = JSON.parse(lunchRes.payload)

  const dinnerRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Beef Stew',
      meal: 'Dinner',
      mainProtein: 'Beef'
    }
  })
  const dinner = JSON.parse(dinnerRes.payload)

  // Create a meal plan
  const planRes = await app.inject({
    method: 'POST',
    url: '/api/meal-plans',
    payload: {
      name: 'Complete Week Plan',
      startDate: new Date('2024-10-01').toISOString(),
      endDate: new Date('2024-10-07').toISOString(),
      
    }
  })
  const plan = JSON.parse(planRes.payload)
  assert.equal(plan.name, 'Complete Week Plan')

  // Add recipes for different days
  const days = ['Monday', 'Tuesday', 'Wednesday']
  for (const day of days) {
    await app.inject({
      method: 'POST',
      url: `/api/meal-plans/${plan.id}/recipes`,
      payload: { recipeId: breakfast.id, day, mealType: 'Breakfast' }
    })
    await app.inject({
      method: 'POST',
      url: `/api/meal-plans/${plan.id}/recipes`,
      payload: { recipeId: lunch.id, day, mealType: 'Lunch' }
    })
    await app.inject({
      method: 'POST',
      url: `/api/meal-plans/${plan.id}/recipes`,
      payload: { recipeId: dinner.id, day, mealType: 'Dinner' }
    })
  }

  // Get the complete meal plan
  const fullPlanRes = await app.inject({
    method: 'GET',
    url: `/api/meal-plans/${plan.id}`
  })
  const fullPlan = JSON.parse(fullPlanRes.payload)
  assert.equal(fullPlan.recipes.length, 9) // 3 meals × 3 days
  

  // Get recipes for a specific day
  const mondayRes = await app.inject({
    method: 'GET',
    url: `/api/meal-plans/${plan.id}/days/Monday`
  })
  const mondayRecipes = JSON.parse(mondayRes.payload)
  assert.equal(mondayRecipes.length, 3)

  // Update a day completely
  await app.inject({
    method: 'PUT',
    url: `/api/meal-plans/${plan.id}/days/Monday`,
    payload: {
      recipes: [
        { recipeId: breakfast.id, mealType: 'Breakfast' },
        { recipeId: dinner.id, mealType: 'Dinner' }
      ]
    }
  })

  const updatedMondayRes = await app.inject({
    method: 'GET',
    url: `/api/meal-plans/${plan.id}/days/Monday`
  })
  const updatedMonday = JSON.parse(updatedMondayRes.payload)
  assert.equal(updatedMonday.length, 2) // Now only 2 meals

  // Update plan name
  await app.inject({
    method: 'PUT',
    url: `/api/meal-plans/${plan.id}`,
    payload: { name: 'Updated Week Plan' }
  })

  const updatedPlanRes = await app.inject({
    method: 'GET',
    url: `/api/meal-plans/${plan.id}`
  })
  const updatedPlan = JSON.parse(updatedPlanRes.payload)
  assert.equal(updatedPlan.name, 'Updated Week Plan')

  // Delete the plan
  const deleteRes = await app.inject({
    method: 'DELETE',
    url: `/api/meal-plans/${plan.id}`
  })
  assert.equal(deleteRes.statusCode, 204)
})
