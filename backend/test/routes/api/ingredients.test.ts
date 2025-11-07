import { test } from 'node:test'
import assert from 'node:assert'
import { build } from '../../helper.ts'

test('GET /api/ingredients - get all ingredients', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'GET',
    url: '/api/ingredients'
  })

  assert.equal(res.statusCode, 200)
  assert.ok(Array.isArray(JSON.parse(res.payload)))
})

test('POST /api/ingredients - create a new ingredient', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/api/ingredients',
    payload: {
      name: 'Test Ingredient',
    }
  })

  assert.equal(res.statusCode, 201)
  const ingredient = JSON.parse(res.payload)
  assert.equal(ingredient.name, 'Test Ingredient')
  assert.ok(ingredient.id)
})

test('POST /api/ingredients - should fail without required fields', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'POST',
    url: '/api/ingredients',
    payload: {
      // Missing data
    }
  })

  assert.equal(res.statusCode, 400)
})


test('GET /api/ingredients/:id - get a specific ingredient', async (t) => {
  const app = await build(t)

  // Create an ingredient
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/ingredients',
    payload: {
      name: 'Specific Ingredient',
    }
  })
  const createdIngredient = JSON.parse(createRes.payload)

  // Get the ingredient
  const res = await app.inject({
    method: 'GET',
    url: `/api/ingredients/${createdIngredient.id}`
  })

  assert.equal(res.statusCode, 200)
  const ingredient = JSON.parse(res.payload)
  assert.equal(ingredient.id, createdIngredient.id)
  assert.equal(ingredient.name, 'Specific Ingredient')
})

test('GET /api/ingredients/:id - should return 404 for non-existent ingredient', async (t) => {
  const app = await build(t)

  const res = await app.inject({
    method: 'GET',
    url: '/api/ingredients/99999'
  })

  assert.equal(res.statusCode, 404)
  const error = JSON.parse(res.payload)
  assert.ok(error.error)
})

test('PUT /api/ingredients/:id - update an ingredient', async (t) => {
  const app = await build(t)

  // Create ingredient
  const originalRes = await app.inject({
    method: 'POST',
    url: '/api/ingredients',
    payload: {
      name: 'Original Ingredient',
    }
  })
  const original = JSON.parse(originalRes.payload)

  // Update the ingredient
  const res = await app.inject({
    method: 'PUT',
    url: `/api/ingredients/${original.id}`,
    payload: {
      name: 'Updated Name',
    }
  })

  assert.equal(res.statusCode, 200)
  const updated = JSON.parse(res.payload)
  assert.equal(updated.name, 'Updated Name')
})

test('DELETE /api/ingredients/:id - delete an ingredient', async (t) => {
  const app = await build(t)

  // Create an ingredient
  const createRes = await app.inject({
    method: 'POST',
    url: '/api/ingredients',
    payload: {
      name: 'To Be Deleted',
    }
  })
  const createdIngredient = JSON.parse(createRes.payload)

  // Delete the ingredient
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/ingredients/${createdIngredient.id}`
  })

  assert.equal(res.statusCode, 204)

  // Verify it's deleted
  const getRes = await app.inject({
    method: 'GET',
    url: `/api/ingredients/${createdIngredient.id}`
  })
  assert.equal(getRes.statusCode, 404)
})

