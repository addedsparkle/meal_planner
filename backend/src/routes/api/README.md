# API Documentation

This document describes all available API endpoints for the Meal Planner application.

## Base URL

All endpoints are prefixed with `/api`

## Recipes

### List All Recipes
```
GET /api/recipes
```

**Response**: `200 OK`
```json
[
  {
    "id": "1",
    "name": "Chicken Stir Fry",
    "instructions": "1. Cut chicken\n2. Stir fry\n3. Serve",
    "mainProtein": "Chicken",
    "meal": "Dinner",
    "canBatch": true,
    "lastUsed": ""
  }
]
```

### Get Single Recipe
```
GET /api/recipes/:id
```

**Parameters**:
- `id` (string) - Recipe ID

**Response**: `200 OK`
```json
{
  "id": "1",
  "name": "Chicken Stir Fry",
  "instructions": "1. Cut chicken\n2. Stir fry\n3. Serve",
  "mainProtein": "Chicken",
  "meal": "Dinner",
  "canBatch": true,
  "lastUsed": "",
  "ingredients": [
    {
      "id": 1,
      "name": "Chicken Breast",
      "amount": 1,
      "unit": "lb"
    }
  ]
}
```

**Error Response**: `404 Not Found`
```json
{
  "error": "Recipe not found"
}
```

### Create Recipe
```
POST /api/recipes
```

**Request Body**:
```json
{
  "name": "Scrambled Eggs",
  "instructions": "Beat eggs and cook in butter",
  "mainProtein": "Egg",
  "meal": "Breakfast",
  "canBatch": false
}
```

**Response**: `201 Created`
```json
{
  "id": "2",
  "name": "Scrambled Eggs",
  "instructions": "Beat eggs and cook in butter",
  "mainProtein": "Egg",
  "meal": "Breakfast",
  "canBatch": false,
  "lastUsed": ""
}
```

### Update Recipe
```
PUT /api/recipes/:id
```

**Parameters**:
- `id` (string) - Recipe ID

**Request Body**: Same as Create Recipe

**Response**: `200 OK` or `404 Not Found`

**Status**: Not yet implemented

### Delete Recipe
```
DELETE /api/recipes/:id
```

**Parameters**:
- `id` (string) - Recipe ID

**Response**: `204 No Content`

**Error Response**: `404 Not Found`

### Add Ingredient to Recipe
```
POST /api/recipes/:id/ingredients
```

**Parameters**:
- `id` (string) - Recipe ID

**Request Body**:
```json
{
  "name": "Chicken Breast",
  "amount": 1,
  "unit": "lb"
}
```

**Valid Units**: `g`, `ml`, `pieces`, `cup`, `tbsp`, `tsp`

**Response**: `201 Created`
```json
{
  "recipeId": 1,
  "ingredientId": 1,
  "amount": 1,
  "unit": "lb"
}
```

**Note**: If the ingredient doesn't exist, it will be created automatically.

### Remove Ingredient from Recipe
```
DELETE /api/recipes/:id/ingredients/:ingredientId
```

**Parameters**:
- `id` (string) - Recipe ID
- `ingredientId` (string) - Ingredient ID

**Response**: `204 No Content`

**Note**: This only removes the relationship; the ingredient itself is not deleted.

### Update Recipe Ingredient
```
PUT /api/recipes/:id/ingredients/:ingredientId
```

**Parameters**:
- `id` (string) - Recipe ID
- `ingredientId` (string) - Ingredient ID

**Request Body**:
```json
{
  "amount": 2,
  "unit": "cup"
}
```

**Valid Units**: `g`, `ml`, `pieces`, `cup`, `tbsp`, `tsp`

**Response**: `200 OK`
```json
{
  "recipeId": 1,
  "ingredientId": 1,
  "amount": 2,
  "unit": "cup"
}
```

## Ingredients

### List All Ingredients
```
GET /api/ingredients
```

**Response**: `200 OK`
```json
[
  {
    "id": "1",
    "name": "Chicken Breast",
    "defaultUnit": "lb"
  }
]
```

### Get Single Ingredient
```
GET /api/ingredients/:id
```

**Parameters**:
- `id` (string) - Ingredient ID

**Response**: `200 OK`
```json
{
  "id": "1",
  "name": "Chicken Breast",
  "defaultUnit": "lb"
}
```

**Error Response**: `404 Not Found`
```json
{
  "error": "Ingredient not found"
}
```

### Get Recipes Using Ingredient
```
GET /api/ingredients/:id/recipes
```

**Parameters**:
- `id` (string) - Ingredient ID

**Response**: `200 OK`

Returns the ingredient along with all recipes that use it.

**Error Response**: `404 Not Found`

## Week Plans

### List All Week Plans
```
GET /api/week-plans
```

**Response**: `200 OK`
```json
[]
```

**Status**: Not yet implemented

### Create Week Plan
```
POST /api/week-plans
```

**Request Body**: Week plan object (following weekPlan schema)

**Response**: `201 Created`

**Status**: Not yet implemented

### Get Current Week Plan
```
GET /api/week-plans/current
```

**Response**: `200 OK` or `404 Not Found`

**Status**: Not yet implemented

## Schema Validation

All endpoints use JSON Schema validation via Fastify schemas:
- Request bodies are validated against defined schemas
- Response bodies are serialized using fast-json-stringify
- Type safety is enforced through TypeScript

## Error Responses

Standard HTTP status codes are used:
- `200 OK` - Successful GET/PUT requests
- `201 Created` - Successful POST requests
- `204 No Content` - Successful DELETE requests
- `400 Bad Request` - Invalid request body
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
