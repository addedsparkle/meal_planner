import { test } from 'node:test'
import assert from 'node:assert'
import { build } from '../../helper.ts'

test('GET /api/recipes - get all recipes', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'GET',
    url: '/api/recipes'
  })

  assert.equal(res.statusCode, 200)
  assert.ok(Array.isArray(JSON.parse(res.payload)))
})

test('POST /api/recipes - create a new recipe', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Test Recipe',
      meal: ['Dinner'],
      mainProtein: 'Chicken'
    }
  })

  assert.equal(res.statusCode, 201)
  const recipe = JSON.parse(res.payload)
  assert.equal(recipe.name, 'Test Recipe')
  assert.equal(recipe.mainProtein, 'Chicken')
  assert.ok(recipe.id)
})

test('POST /api/recipes - should fail without required fields', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      // Missing required fields
    }
  })

  assert.equal(res.statusCode, 400)
})

test('GET /api/recipes/:id - get a specific recipe', async (t) => {
  const app = await build(t)

  // Create a recipe
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Specific Recipe',
      meal: ['Lunch', 'Dinner'],
      mainProtein: 'Beef'
    }
  })
  const createdRecipe = JSON.parse(createRes.payload)

  // Get the recipe
  const res = await app.inject({
    method: 'GET',
    url: `/api/recipes/${createdRecipe.id}`
  })

  assert.equal(res.statusCode, 200)
  const recipe = JSON.parse(res.payload)
  assert.equal(recipe.id, createdRecipe.id)
  assert.equal(recipe.name, 'Specific Recipe')
  assert.ok(Array.isArray(recipe.meal))
  assert.equal(recipe.meal.length, 2)
  assert.ok(recipe.meal.includes('Lunch'))
  assert.ok(recipe.meal.includes('Dinner'))
  assert.equal(recipe.mainProtein, 'Beef')
})

test('GET /api/recipes/:id - should return 404 for non-existent recipe', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'GET',
    url: '/api/recipes/99999'
  })

  assert.equal(res.statusCode, 404)
  const error = JSON.parse(res.payload)
  assert.ok(error.error)
})

test('PUT /api/recipes/:id - update a recipe (not implemented)', async (t) => {
  const app = await build(t)

  // Create a recipe
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Original Recipe',
      meal: ['Breakfast'],
      mainProtein: 'Egg'
    }
  })
  const original = JSON.parse(createRes.payload)

  // Try to update the recipe (currently returns 404 as not implemented)
  const res = await app.inject({
    method: 'PUT',
    url: `/api/recipes/${original.id}`,
    payload: {
      name: 'Updated Recipe',
      meal: ['Breakfast', 'Lunch'],
      mainProtein: 'Egg'
    }
  })

  // Currently not implemented, so expecting 404
  assert.equal(res.statusCode, 404)
})

test('DELETE /api/recipes/:id - delete a recipe', async (t) => {
  const app = await build(t)

  // Create a recipe
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'To Be Deleted',
      meal: ['Snack'],
      mainProtein: 'Pork'
    }
  })
  const createdRecipe = JSON.parse(createRes.payload)

  // Delete the recipe
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/recipes/${createdRecipe.id}`
  })

  assert.equal(res.statusCode, 204)

  // Verify it's deleted
  const getRes = await app.inject({
    method: 'GET',
    url: `/api/recipes/${createdRecipe.id}`
  })
  assert.equal(getRes.statusCode, 404)
})

test('POST /api/recipes/:id/ingredients - add ingredient to recipe', async (t) => {
  const app = await build(t)

  // Create a recipe
  const recipeRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Pasta Recipe',
      meal: ['Dinner'],
      mainProtein: 'None'
    }
  })
  const recipe = JSON.parse(recipeRes.payload)

  // Add ingredient to recipe
  const res = await app.inject({
    method: 'POST',
    url: `/api/recipes/${recipe.id}/ingredients`,
    payload: {
      name: 'Pasta',
      amount: 200,
      unit: 'g'
    }
  })

  assert.equal(res.statusCode, 201)
  const ingredient = JSON.parse(res.payload)
  assert.equal(ingredient.recipeId, recipe.id)
  assert.equal(ingredient.amount, 200)
  assert.equal(ingredient.unit, 'g')
  assert.ok(ingredient.ingredientId)
})

test('POST /api/recipes/:id/ingredients - should fail without required fields', async (t) => {
  const app = await build(t)

  // Create a recipe
  const recipeRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Test Recipe',
      meal: ['Dinner'],
      mainProtein: 'Chicken'
    }
  })
  const recipe = JSON.parse(recipeRes.payload)

  // Try to add ingredient without required fields
  const res = await app.inject({
    method: 'POST',
    url: `/api/recipes/${recipe.id}/ingredients`,
    payload: {
      name: 'Incomplete Ingredient'
      // Missing amount and unit
    }
  })

  assert.equal(res.statusCode, 400)
})

test('PUT /api/recipes/:id/ingredients/:ingredientId - update ingredient amount/unit', async (t) => {
  const app = await build(t)

  // Create a recipe
  const recipeRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Soup Recipe',
      meal: ['Lunch'],
      mainProtein: 'Chicken'
    }
  })
  const recipe = JSON.parse(recipeRes.payload)

  // Add ingredient
  const addRes = await app.inject({
    method: 'POST',
    url: `/api/recipes/${recipe.id}/ingredients`,
    payload: {
      name: 'Water',
      amount: 500,
      unit: 'ml'
    }
  })
  const ingredient = JSON.parse(addRes.payload)

  // Update ingredient
  const res = await app.inject({
    method: 'PUT',
    url: `/api/recipes/${recipe.id}/ingredients/${ingredient.ingredientId}`,
    payload: {
      amount: 1000,
      unit: 'ml'
    }
  })

  assert.equal(res.statusCode, 200)
  const updated = JSON.parse(res.payload)
  assert.equal(updated.amount, 1000)
  assert.equal(updated.unit, 'ml')
})

test('DELETE /api/recipes/:id/ingredients/:ingredientId - remove ingredient from recipe', async (t) => {
  const app = await build(t)

  // Create a recipe
  const recipeRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Salad Recipe',
      meal: ['Lunch'],
      mainProtein: 'None'
    }
  })
  const recipe = JSON.parse(recipeRes.payload)

  // Add ingredient
  const addRes = await app.inject({
    method: 'POST',
    url: `/api/recipes/${recipe.id}/ingredients`,
    payload: {
      name: 'Lettuce',
      amount: 100,
      unit: 'g'
    }
  })
  const ingredient = JSON.parse(addRes.payload)

  // Remove ingredient
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/recipes/${recipe.id}/ingredients/${ingredient.ingredientId}`
  })

  assert.equal(res.statusCode, 204)
})

test('Complete recipe workflow with ingredients', async (t) => {
  const app = await build(t)

  // Create a recipe
  const recipeRes = await app.inject({
    method: 'POST',
    url: '/api/recipes',
    payload: {
      name: 'Chicken Stir Fry',
      meal: ['Dinner', 'Lunch'],
      mainProtein: 'Chicken'
    }
  })
  const recipe = JSON.parse(recipeRes.payload)
  assert.equal(recipe.name, 'Chicken Stir Fry')

  // Add multiple ingredients
  const ingredients = [
    { name: 'Chicken Breast', amount: 300, unit: 'g' },
    { name: 'Soy Sauce', amount: 2, unit: 'tbsp' },
    { name: 'Bell Pepper', amount: 1, unit: 'pieces' },
    { name: 'Rice', amount: 200, unit: 'g' }
  ]

  const addedIngredients = []
  for (const ing of ingredients) {
    const res = await app.inject({
      method: 'POST',
      url: `/api/recipes/${recipe.id}/ingredients`,
      payload: ing
    })
    assert.equal(res.statusCode, 201)
    addedIngredients.push(JSON.parse(res.payload))
  }

  // Get recipe with ingredients
  const fullRecipeRes = await app.inject({
    method: 'GET',
    url: `/api/recipes/${recipe.id}`
  })
  const fullRecipe = JSON.parse(fullRecipeRes.payload)
  assert.ok(Array.isArray(fullRecipe.ingredients))
  assert.equal(fullRecipe.ingredients.length, 4)

  // Update one ingredient
  const firstIngredient = addedIngredients[0]
  await app.inject({
    method: 'PUT',
    url: `/api/recipes/${recipe.id}/ingredients/${firstIngredient.ingredientId}`,
    payload: {
      amount: 400,
      unit: 'g'
    }
  })

  // Remove one ingredient
  const lastIngredient = addedIngredients[addedIngredients.length - 1]
  await app.inject({
    method: 'DELETE',
    url: `/api/recipes/${recipe.id}/ingredients/${lastIngredient.ingredientId}`
  })

  // Verify final state
  const finalRecipeRes = await app.inject({
    method: 'GET',
    url: `/api/recipes/${recipe.id}`
  })
  const finalRecipe = JSON.parse(finalRecipeRes.payload)
  assert.equal(finalRecipe.ingredients.length, 3)

  // Delete the recipe
  const deleteRes = await app.inject({
    method: 'DELETE',
    url: `/api/recipes/${recipe.id}`
  })
  assert.equal(deleteRes.statusCode, 204)

  // Verify deletion
  const getDeletedRes = await app.inject({
    method: 'GET',
    url: `/api/recipes/${recipe.id}`
  })
  assert.equal(getDeletedRes.statusCode, 404)
})
