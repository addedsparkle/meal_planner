# Meal Planner

A self-hosted meal planning application designed to run on a Raspberry Pi. Plan weekly meals, manage a recipe library, and generate shopping lists.

## Features

- **Recipe library** — Create, edit, and delete recipes with ingredients, quantities, and units
- **CSV import** — Bulk-import recipes from a spreadsheet
- **Meal plan generation** — Auto-generate weekly plans with breakfast/lunch/dinner, distributed by protein to avoid repetition
- **Breakfast scheduling** — Mark recipes as weekday-only (batch cook), weekend-only (longer prep), or any day
- **Meal plan editor** — Swap recipes on any day with a single click
- **Shopping list** — Select a meal plan and get a combined, categorised shopping list with quantities summed by unit
- **Ingredient units** — Attach standard measurement units to ingredients for automatic quantity combining

---

## Development Setup

### Prerequisites

- Node.js 20+
- npm 10+

### Install dependencies

```bash
npm install
```

### Run in development

Start the backend and frontend in separate terminals:

```bash
# Terminal 1 — API (port 3000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

The frontend proxies `/api` requests to the backend automatically.

### Run tests

```bash
cd backend && npm test
```

### Run Storybook

```bash
cd frontend && npm run storybook
```

---

## Project Structure

```
/
├── backend/
│   ├── drizzle/          # SQL migrations
│   ├── src/
│   │   ├── db/           # Drizzle schema and connection
│   │   ├── routes/       # Fastify route handlers
│   │   ├── services/     # Business logic
│   │   ├── types/        # Zod schemas and TypeScript types
│   │   └── test/         # Integration tests
│   └── drizzle.config.ts
├── frontend/
│   └── src/
│       ├── components/   # UI and feature components
│       ├── hooks/        # TanStack Query hooks
│       ├── lib/          # API client and shared types
│       └── pages/        # Page-level components
└── examples/
    └── sample-recipes.csv
```

---

## API Reference

The API runs on port 3000. Interactive documentation (Swagger UI) is available at `http://localhost:3000/docs` when running in development.

### Recipes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/recipes` | List all recipes |
| `POST` | `/api/recipes` | Create a recipe |
| `GET` | `/api/recipes/:id` | Get a recipe by ID |
| `PUT` | `/api/recipes/:id` | Update a recipe |
| `DELETE` | `/api/recipes/:id` | Delete a recipe |
| `POST` | `/api/recipes/import` | Import recipes from CSV |

### Ingredients

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/ingredients` | List all ingredients |
| `POST` | `/api/ingredients` | Create an ingredient |
| `PUT` | `/api/ingredients/:id` | Update an ingredient |
| `DELETE` | `/api/ingredients/:id` | Delete an ingredient (if unused) |

### Meal Plans

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/meal-plans` | List all meal plans |
| `POST` | `/api/meal-plans` | Create a meal plan |
| `GET` | `/api/meal-plans/:id` | Get a meal plan with days |
| `PUT` | `/api/meal-plans/:id` | Update a meal plan |
| `DELETE` | `/api/meal-plans/:id` | Delete a meal plan |
| `POST` | `/api/meal-plans/generate` | Auto-generate a meal plan |

### Shopping List

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/shopping-list?mealPlanId=X` | Get shopping list for a meal plan |

---

## CSV Import Format

Recipes can be bulk-imported via CSV. A sample file is provided at [`examples/sample-recipes.csv`](examples/sample-recipes.csv).

### Columns

| Column | Required | Description |
|--------|----------|-------------|
| `name` | Yes | Recipe name |
| `description` | No | Short description |
| `protein` | No | Main protein (e.g. `chicken`, `beef`, `fish`) |
| `meal_types` | No | Comma-separated: `breakfast`, `lunch`, `dinner`. Defaults to `dinner` |
| `freezable` | No | `true` or `1` to mark as freezable |
| `ingredients` | No | Comma-separated list (see below) |

### Ingredient format

Each ingredient entry is `name (quantity)`. The quantity is optional — if omitted, a default of `1` is used.

```
chicken breast (400g), broccoli (200g), soy sauce (3 tbsp), garlic (2 cloves)
```

If an ingredient string contains a comma, wrap the entire `ingredients` cell in double-quotes (standard CSV quoting).

### Example row

```csv
name,description,protein,meal_types,freezable,ingredients
Chicken Stir Fry,Quick stir fry,chicken,dinner,false,"chicken breast (400g), broccoli (200g), soy sauce (3 tbsp)"
```

### Import behaviour

- Recipes with a missing name are skipped and reported as errors
- Duplicate recipe names are created as separate entries (no deduplication)
- Ingredients are normalised to lowercase and deduplicated across the library
- The response includes a summary: `{ created, skipped, errors }`

---

## Breakfast Scheduling

When a recipe has `breakfast` as one of its meal types, you can set its **suitability**:

| Value | Meaning |
|-------|---------|
| `any` | Can appear any day (default) |
| `weekday` | Batch-cook recipes used Mon–Fri in 3-day rotations |
| `weekend` | Longer-prep recipes used on Sat/Sun |

During meal plan generation:
- Weekday and `any` breakfast recipes rotate in **3-day batches** (so you cook once and eat for 3 days). A new batch never starts on a weekend — if a batch starts on Thursday it carries through Saturday.
- If weekend-specific recipes exist, they rotate daily on Saturday and Sunday.
- If no weekend-specific recipes exist, the current weekday batch extends through the weekend.

---

## Troubleshooting

**Backend fails to start**

Check that port 3000 is not already in use:
```bash
lsof -i :3000
```

**Database errors on startup**

The database file is created automatically at `./data/meal-planner.db`. Ensure the `data/` directory is writable, or set the `DATABASE_URL` environment variable to a custom path.

**Migrations not applied**

Run migrations manually:
```bash
cd backend && npm run migrate
```

**Frontend shows API errors**

Ensure the backend is running and the Vite dev server proxy is configured. Check `frontend/vite.config.ts` for the proxy target — it should point to `http://localhost:3000`.

**CSV import returns errors**

- Ensure the file is UTF-8 encoded
- Check that ingredient strings with commas are wrapped in double-quotes
- Verify the header row matches the documented column names exactly
