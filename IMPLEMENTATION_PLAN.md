# Meal Planner - Implementation Plan

## Overview

This document outlines the complete implementation plan for rebuilding the Meal Planner application from scratch with a modern, lightweight architecture optimized for Raspberry Pi deployment.

## Architecture Summary

- **Backend:** Node.js 20+ with Fastify, Drizzle ORM, SQLite
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, TanStack Query
- **Deployment:** Native systemd service with Nginx reverse proxy
- **Database:** SQLite with Drizzle migrations
- **API Documentation:** Auto-generated OpenAPI/Swagger

## Prerequisites

- Node.js 20+ installed on development machine
- Raspberry Pi with Raspbian/Ubuntu (for deployment)
- Nginx installed on Raspberry Pi
- Git for version control
- Basic understanding of TypeScript, React, and REST APIs

---

## Phase 1: Project Setup & Structure

### Task 1.1: Initialize Monorepo Structure
**Estimate:** 30 minutes

**Steps:**
1. Create new directory structure:
   ```
   /meal-planner
     /backend
     /frontend
     /scripts
     /data (gitignored)
   ```
2. Initialize root `package.json` with workspaces
3. Create `.gitignore` file
4. Initialize Git repository

**Acceptance Criteria:**
- Workspace structure is set up
- Root package.json has workspace configuration
- Git repository initialized

**Files to Create:**
- `/package.json`
- `/.gitignore`
- `/README.md`

---

### Task 1.2: Backend Project Initialization
**Estimate:** 45 minutes

**Steps:**
1. Initialize backend package.json
2. Install dependencies:
   - Fastify + plugins (@fastify/swagger, @fastify/swagger-ui, @fastify/multipart, @fastify/cors)
   - Drizzle ORM + better-sqlite3
   - Zod for validation
   - csv-parse for CSV import
   - tsx for development
3. Create directory structure:
   ```
   /backend
     /src
       /routes
       /services
       /db
         schema.ts
         index.ts
       /types
       index.ts
     /drizzle
     tsconfig.json
     drizzle.config.ts
   ```
4. Configure TypeScript
5. Configure Drizzle

**Acceptance Criteria:**
- Backend dependencies installed
- TypeScript configured with strict mode
- Drizzle config pointing to SQLite
- Development script works (`npm run dev`)

**Files to Create:**
- `/backend/package.json`
- `/backend/tsconfig.json`
- `/backend/drizzle.config.ts`
- `/backend/src/index.ts`

---

### Task 1.3: Frontend Project Initialization
**Estimate:** 45 minutes

**Steps:**
1. Initialize Vite + React + TypeScript project
2. Install dependencies:
   - React 19 + React DOM
   - TanStack Query + TanStack Router
   - Tailwind CSS
   - react-hook-form + zod
   - date-fns
   - lucide-react (icons)
3. Create directory structure:
   ```
   /frontend
     /src
       /components
         /ui
         /recipes
         /meal-plans
         /shopping
       /hooks
       /lib
       /pages
       App.tsx
       main.tsx
     tsconfig.json
     vite.config.ts
     tailwind.config.js
   ```
4. Configure Tailwind CSS
5. Configure Vite proxy for API during development

**Acceptance Criteria:**
- Frontend dependencies installed
- TypeScript configured
- Tailwind CSS working
- Development server runs (`npm run dev`)
- Vite proxies `/api` to `http://localhost:3000`

**Files to Create:**
- `/frontend/package.json`
- `/frontend/tsconfig.json`
- `/frontend/vite.config.ts`
- `/frontend/tailwind.config.js`
- `/frontend/src/main.tsx`
- `/frontend/src/App.tsx`

---

## Phase 2: Database Schema & Migrations

### Task 2.1: Define Database Schema
**Estimate:** 1 hour

**Steps:**
1. Create Drizzle schema in `/backend/src/db/schema.ts`
2. Define tables:
   - `recipes` (id, name, description, servings, prep_time, cook_time, instructions, metadata, timestamps)
   - `ingredients` (id, name, category, created_at)
   - `recipe_ingredients` (id, recipe_id, ingredient_id, quantity, notes)
   - `meal_plans` (id, name, start_date, end_date, created_at)
   - `meal_plan_days` (id, meal_plan_id, day_date, recipe_id, meal_type)
3. Define relationships and constraints
4. Export TypeScript types from schema

**Acceptance Criteria:**
- All tables defined with proper types
- Foreign key relationships configured
- Unique constraints in place
- TypeScript types exported

**Files to Create:**
- `/backend/src/db/schema.ts`

---

### Task 2.2: Create Migration System
**Estimate:** 45 minutes

**Steps:**
1. Create initial migration using Drizzle Kit
2. Create `migrate.ts` script to run migrations programmatically
3. Add migration scripts to package.json
4. Test migration on clean database

**Acceptance Criteria:**
- `drizzle-kit generate:sqlite` creates migration files
- `npm run migrate` applies migrations successfully
- Migration creates all tables with correct schema
- Migration script can be run standalone for deployment

**Files to Create:**
- `/backend/src/db/migrate.ts`
- `/backend/drizzle/0000_initial_schema.sql` (auto-generated)

---

### Task 2.3: Create Database Service Layer
**Estimate:** 1 hour

**Steps:**
1. Create database connection utility (`/backend/src/db/index.ts`)
2. Create prepared statements for common queries
3. Export typed database instance
4. Add database initialization on server startup

**Acceptance Criteria:**
- Database connection established on startup
- Connection uses SQLite file from environment variable
- Database instance is typed and ready for queries
- Error handling for database connection failures

**Files to Create:**
- `/backend/src/db/index.ts`

---

## Phase 3: Backend API - Core Functionality

### Task 3.1: Setup Fastify Server with OpenAPI
**Estimate:** 1 hour

**Steps:**
1. Configure Fastify instance in `/backend/src/index.ts`
2. Register @fastify/swagger and @fastify/swagger-ui
3. Configure OpenAPI schema metadata
4. Add CORS support for development
5. Create health check endpoint (`GET /health`)
6. Test Swagger UI at `/docs`

**Acceptance Criteria:**
- Fastify server starts on port 3000
- Swagger UI accessible at `/docs`
- Health check returns 200 OK
- CORS configured for development

**Files to Create:**
- `/backend/src/index.ts` (complete server setup)
- `/backend/src/config.ts` (environment configuration)

---

### Task 3.2: Recipes API Endpoints
**Estimate:** 3 hours

**Steps:**
1. Create `/backend/src/routes/recipes.ts`
2. Implement endpoints:
   - `GET /api/recipes` - List all recipes with optional filters
   - `POST /api/recipes` - Create recipe with ingredients
   - `GET /api/recipes/:id` - Get single recipe with ingredients
   - `PUT /api/recipes/:id` - Update recipe
   - `DELETE /api/recipes/:id` - Delete recipe
3. Create Zod schemas for request validation
4. Create service layer (`/backend/src/services/recipeService.ts`)
5. Handle ingredient creation/linking in transactions
6. Add OpenAPI documentation to routes
7. Test all endpoints

**Acceptance Criteria:**
- All CRUD operations work correctly
- Validation errors return 400 with clear messages
- Ingredients are normalized (no duplicates)
- Transactions ensure data consistency
- OpenAPI docs show all endpoints with schemas

**Files to Create:**
- `/backend/src/routes/recipes.ts`
- `/backend/src/services/recipeService.ts`
- `/backend/src/types/recipe.ts`

---

### Task 3.3: CSV Import Endpoint
**Estimate:** 2 hours

**Steps:**
1. Add CSV import endpoint to recipes routes (`POST /api/recipes/import`)
2. Implement multipart file upload handling
3. Parse CSV file with csv-parse
4. Validate CSV format and required columns
5. Process recipes in transaction batches
6. Parse ingredient strings (pipe-separated)
7. Return detailed import summary (created, skipped, errors)
8. Add error handling for malformed CSV

**Acceptance Criteria:**
- Accepts CSV file upload
- Parses ingredients from pipe-separated string
- Creates recipes with normalized ingredients
- Returns summary of import results
- Handles errors gracefully (partial imports allowed)
- OpenAPI docs include file upload example

**Files to Create:**
- `/backend/src/services/csvImportService.ts`

---

### Task 3.4: Ingredients API Endpoints
**Estimate:** 1.5 hours

**Steps:**
1. Create `/backend/src/routes/ingredients.ts`
2. Implement endpoints:
   - `GET /api/ingredients` - List all ingredients
   - `POST /api/ingredients` - Create ingredient
   - `PUT /api/ingredients/:id` - Update ingredient
   - `DELETE /api/ingredients/:id` - Delete (if unused)
3. Add validation to prevent deleting ingredients in use
4. Create service layer
5. Add OpenAPI documentation

**Acceptance Criteria:**
- All CRUD operations work
- Cannot delete ingredients used in recipes
- List endpoint supports search/filtering
- OpenAPI docs complete

**Files to Create:**
- `/backend/src/routes/ingredients.ts`
- `/backend/src/services/ingredientService.ts`

---

### Task 3.5: Meal Plans API Endpoints
**Estimate:** 3 hours

**Steps:**
1. Create `/backend/src/routes/mealPlans.ts`
2. Implement endpoints:
   - `GET /api/meal-plans` - List all meal plans
   - `POST /api/meal-plans` - Create meal plan
   - `GET /api/meal-plans/:id` - Get meal plan with days/recipes
   - `PUT /api/meal-plans/:id` - Update meal plan
   - `DELETE /api/meal-plans/:id` - Delete meal plan
   - `POST /api/meal-plans/generate` - Auto-generate meal plan
3. Create service layer with generation logic
4. Implement random recipe assignment algorithm
5. Ensure no duplicate recipes in same week
6. Add date validation

**Acceptance Criteria:**
- Can create manual meal plans
- Auto-generation creates plans for date range
- No duplicate recipes in generated plans
- Meal plans include full recipe details
- OpenAPI docs complete

**Files to Create:**
- `/backend/src/routes/mealPlans.ts`
- `/backend/src/services/mealPlanService.ts`

---

### Task 3.6: Shopping List API Endpoint
**Estimate:** 2 hours

**Steps:**
1. Create `/backend/src/routes/shoppingList.ts`
2. Implement `GET /api/shopping-list?mealPlanId=X`
3. Aggregate ingredients across all recipes in meal plan
4. Group by ingredient name
5. Track which recipes/days need each ingredient
6. Return structured shopping list
7. Create service layer for aggregation logic

**Acceptance Criteria:**
- Generates shopping list from meal plan ID
- Ingredients aggregated correctly
- Shows which recipes need each ingredient
- Handles multiple meal plans (comma-separated IDs)
- OpenAPI docs complete

**Files to Create:**
- `/backend/src/routes/shoppingList.ts`
- `/backend/src/services/shoppingListService.ts`

---

## Phase 4: Frontend Implementation

### Task 4.1: Setup API Client & Types
**Estimate:** 1 hour

**Steps:**
1. Create `/frontend/src/lib/api.ts` with typed fetch wrapper
2. Define API response types
3. Create error handling utilities
4. Export API client functions for all endpoints
5. Configure base URL from environment variable

**Acceptance Criteria:**
- Type-safe API client functions
- Proper error handling
- Environment-based API URL
- Request/response logging in development

**Files to Create:**
- `/frontend/src/lib/api.ts`
- `/frontend/src/lib/types.ts`

---

### Task 4.2: Setup TanStack Query
**Estimate:** 45 minutes

**Steps:**
1. Configure QueryClient in `main.tsx`
2. Create custom hooks in `/frontend/src/hooks/`:
   - `useRecipes.ts`
   - `useMealPlans.ts`
   - `useShoppingList.ts`
   - `useIngredients.ts`
3. Implement queries and mutations
4. Configure cache invalidation strategies

**Acceptance Criteria:**
- QueryClient configured with sensible defaults
- Custom hooks for all major entities
- Mutations invalidate related queries
- Loading and error states handled

**Files to Create:**
- `/frontend/src/hooks/useRecipes.ts`
- `/frontend/src/hooks/useMealPlans.ts`
- `/frontend/src/hooks/useShoppingList.ts`
- `/frontend/src/hooks/useIngredients.ts`

---

### Task 4.3: Create Base UI Components
**Estimate:** 2 hours

**Steps:**
1. Create components in `/frontend/src/components/ui/`:
   - `Button.tsx`
   - `Input.tsx`
   - `Card.tsx`
   - `Modal.tsx`
   - `Spinner.tsx`
   - `ErrorMessage.tsx`
2. Style with Tailwind CSS
3. Make components reusable and composable

**Acceptance Criteria:**
- All base components styled consistently
- Components accept common props (className, disabled, etc.)
- Accessible HTML elements used
- No accessibility features required (per requirements)

**Files to Create:**
- `/frontend/src/components/ui/Button.tsx`
- `/frontend/src/components/ui/Input.tsx`
- `/frontend/src/components/ui/Card.tsx`
- `/frontend/src/components/ui/Modal.tsx`
- `/frontend/src/components/ui/Spinner.tsx`
- `/frontend/src/components/ui/ErrorMessage.tsx`

---

### Task 4.4: Recipe Management Components
**Estimate:** 4 hours

**Steps:**
1. Create recipe components:
   - `RecipeList.tsx` - Display all recipes in grid/list
   - `RecipeCard.tsx` - Individual recipe display
   - `RecipeForm.tsx` - Create/edit recipe form
   - `RecipeDetail.tsx` - Full recipe view
   - `CSVImporter.tsx` - CSV file upload
2. Implement form validation with react-hook-form + Zod
3. Add ingredient management in recipe form
4. Wire up to TanStack Query hooks
5. Add loading and error states
6. Style with Tailwind

**Acceptance Criteria:**
- Can view all recipes
- Can create/edit/delete recipes
- Form validation works
- Ingredients can be added/removed in form
- CSV import works with progress feedback
- Responsive design

**Files to Create:**
- `/frontend/src/components/recipes/RecipeList.tsx`
- `/frontend/src/components/recipes/RecipeCard.tsx`
- `/frontend/src/components/recipes/RecipeForm.tsx`
- `/frontend/src/components/recipes/RecipeDetail.tsx`
- `/frontend/src/components/recipes/CSVImporter.tsx`

---

### Task 4.5: Meal Plan Components
**Estimate:** 4 hours

**Steps:**
1. Create meal plan components:
   - `MealPlanList.tsx` - Display all meal plans
   - `MealPlanCalendar.tsx` - Week view with recipes
   - `MealPlanGenerator.tsx` - Form to generate new plan
   - `MealPlanEditor.tsx` - Edit existing plan
2. Implement date range selection
3. Add recipe assignment/replacement functionality
4. Wire up to TanStack Query hooks
5. Style calendar view
6. Add drag-and-drop for recipe replacement (optional enhancement)

**Acceptance Criteria:**
- Can view all meal plans
- Can generate new meal plans
- Calendar shows week view with recipes
- Can replace recipes in meal plan
- Date validation works
- Responsive design

**Files to Create:**
- `/frontend/src/components/meal-plans/MealPlanList.tsx`
- `/frontend/src/components/meal-plans/MealPlanCalendar.tsx`
- `/frontend/src/components/meal-plans/MealPlanGenerator.tsx`
- `/frontend/src/components/meal-plans/MealPlanEditor.tsx`

---

### Task 4.6: Shopping List Component
**Estimate:** 2 hours

**Steps:**
1. Create `ShoppingList.tsx` component
2. Display ingredients grouped by category (future enhancement)
3. Show which recipes need each ingredient
4. Add print-friendly view
5. Add ability to mark items as completed (UI only, no persistence)
6. Wire up to TanStack Query hook

**Acceptance Criteria:**
- Shopping list displays all ingredients
- Shows recipe associations
- Print-friendly styling
- Can check off items (session only)
- Responsive design

**Files to Create:**
- `/frontend/src/components/shopping/ShoppingList.tsx`

---

### Task 4.7: Setup Routing & Pages
**Estimate:** 2 hours

**Steps:**
1. Install and configure TanStack Router
2. Create page components:
   - `RecipesPage.tsx` - Recipe management
   - `MealPlansPage.tsx` - Meal plan management
   - `ShoppingListPage.tsx` - Shopping list view
3. Create navigation component
4. Setup route definitions
5. Add 404 page

**Acceptance Criteria:**
- All routes work
- Navigation between pages works
- URL updates correctly
- 404 page displays for unknown routes

**Files to Create:**
- `/frontend/src/pages/RecipesPage.tsx`
- `/frontend/src/pages/MealPlansPage.tsx`
- `/frontend/src/pages/ShoppingListPage.tsx`
- `/frontend/src/components/Navigation.tsx`
- `/frontend/src/router.tsx`

---

### Task 4.8: App Layout & Styling
**Estimate:** 2 hours

**Steps:**
1. Create main layout component
2. Add navigation header
3. Style global layout
4. Add responsive design
5. Create loading states for route transitions
6. Polish UI with consistent spacing/colors

**Acceptance Criteria:**
- Clean, consistent layout
- Responsive on mobile/tablet/desktop
- Navigation always visible
- Loading states smooth
- Modern, clean design

**Files to Update:**
- `/frontend/src/App.tsx`
- `/frontend/src/index.css`

---

## Phase 5: Deployment Scripts & Configuration

### Task 5.1: Create Systemd Service File
**Estimate:** 30 minutes

**Steps:**
1. Create `meal-planner-api.service` in `/scripts/`
2. Configure service to run as dedicated user
3. Set environment variables
4. Configure restart policy
5. Set up logging to journald

**Acceptance Criteria:**
- Service file properly formatted
- Environment variables documented
- Restart on failure configured

**Files to Create:**
- `/scripts/meal-planner-api.service`

---

### Task 5.2: Create Nginx Configuration
**Estimate:** 30 minutes

**Steps:**
1. Create `nginx-meal-planner.conf` in `/scripts/`
2. Configure static file serving for frontend
3. Configure reverse proxy for `/api`
4. Set up caching headers
5. Configure gzip compression

**Acceptance Criteria:**
- Static files served efficiently
- API proxy configured correctly
- Caching headers set appropriately
- Gzip enabled

**Files to Create:**
- `/scripts/nginx-meal-planner.conf`

---

### Task 5.3: Create Install Script
**Estimate:** 2 hours

**Steps:**
1. Create `install.sh` in `/scripts/`
2. Add prerequisite checks (Node.js, nginx)
3. Create meal-planner user
4. Create directory structure
5. Copy application files
6. Set permissions
7. Run database migrations
8. Install systemd service
9. Configure nginx
10. Start services
11. Display success message with URLs

**Acceptance Criteria:**
- Script runs without errors
- All prerequisites checked
- Files copied to correct locations
- Services start automatically
- Clear success/error messages
- Idempotent (can run multiple times)

**Files to Create:**
- `/scripts/install.sh`

---

### Task 5.4: Create Update Script
**Estimate:** 1 hour

**Steps:**
1. Create `update.sh` in `/scripts/`
2. Stop service
3. Backup database
4. Copy new files
5. Run migrations
6. Restart service
7. Verify service started

**Acceptance Criteria:**
- Database backed up before update
- Migrations run automatically
- Service restarts cleanly
- Rollback possible if failure

**Files to Create:**
- `/scripts/update.sh`

---

### Task 5.5: Create Uninstall Script
**Estimate:** 45 minutes

**Steps:**
1. Create `uninstall.sh` in `/scripts/`
2. Stop and disable service
3. Remove systemd service file
4. Remove nginx configuration
5. Optionally remove data (with confirmation)
6. Display cleanup summary

**Acceptance Criteria:**
- All services stopped and disabled
- Configuration files removed
- Optional data preservation
- Clear confirmation prompts

**Files to Create:**
- `/scripts/uninstall.sh`

---

### Task 5.6: Create Package Script
**Estimate:** 1 hour

**Steps:**
1. Create `package.sh` in `/scripts/`
2. Build backend and frontend
3. Copy files to release directory
4. Include scripts
5. Create tarball
6. Generate checksums

**Acceptance Criteria:**
- Creates distributable tarball
- Includes all necessary files
- Version number in filename
- Checksums generated

**Files to Create:**
- `/scripts/package.sh`

---

## Phase 6: Testing & Documentation

### Task 6.1: Backend API Testing
**Estimate:** 3 hours

**Steps:**
1. Create test suite for each API endpoint
2. Test CRUD operations
3. Test validation errors
4. Test edge cases
5. Test CSV import with sample data
6. Test meal plan generation
7. Test shopping list aggregation

**Acceptance Criteria:**
- All endpoints have tests
- Happy path and error cases covered
- Tests can run in CI/CD

**Files to Create:**
- `/backend/src/__tests__/` (test files)

---

### Task 6.2: Create Sample CSV Data
**Estimate:** 30 minutes

**Steps:**
1. Create sample recipe CSV with 20-30 recipes
2. Include variety of ingredients
3. Document CSV format in README

**Acceptance Criteria:**
- CSV file with realistic data
- Format documented
- Can be imported successfully

**Files to Create:**
- `/examples/sample-recipes.csv`

---

### Task 6.3: Write Documentation
**Estimate:** 2 hours

**Steps:**
1. Update main README.md with:
   - Project overview
   - Features list
   - Installation instructions
   - Development setup
   - Deployment guide
2. Create API documentation (supplement OpenAPI)
3. Document CSV import format
4. Add troubleshooting section

**Acceptance Criteria:**
- Complete README
- Clear installation steps
- Development workflow documented
- Common issues documented

**Files to Update:**
- `/README.md`

---

### Task 6.4: End-to-End Testing
**Estimate:** 2 hours

**Steps:**
1. Test complete user workflows:
   - Import CSV recipes
   - Create manual recipe
   - Generate meal plan
   - View shopping list
   - Edit meal plan
   - Delete recipe
2. Test on actual Raspberry Pi
3. Verify all deployment scripts work
4. Test update process

**Acceptance Criteria:**
- All workflows complete successfully
- Deployment works on Pi
- Scripts execute without errors
- Service runs reliably

---

## Phase 7: Polish & Optimization

### Task 7.1: Performance Optimization
**Estimate:** 2 hours

**Steps:**
1. Optimize database queries (add indexes)
2. Implement query result caching where appropriate
3. Optimize frontend bundle size
4. Add lazy loading for routes
5. Optimize images/assets

**Acceptance Criteria:**
- Database queries optimized
- Frontend bundle under 500KB gzipped
- Lazy loading working
- Fast page loads

---

### Task 7.2: Error Handling & Logging
**Estimate:** 2 hours

**Steps:**
1. Improve error messages throughout app
2. Add structured logging to backend
3. Add user-friendly error messages to frontend
4. Configure log rotation on Pi

**Acceptance Criteria:**
- Clear error messages
- Logs are structured and useful
- No sensitive data in logs
- Log rotation configured

---

### Task 7.3: UI Polish
**Estimate:** 2 hours

**Steps:**
1. Review all UI components for consistency
2. Add smooth transitions
3. Improve mobile responsiveness
4. Add empty states for lists
5. Add loading skeletons
6. Polish form UX

**Acceptance Criteria:**
- Consistent design throughout
- Smooth animations
- Works well on mobile
- No jarring loading states

---

## Total Estimated Time

- **Phase 1:** ~2 hours (Project Setup)
- **Phase 2:** ~2.75 hours (Database)
- **Phase 3:** ~12.5 hours (Backend API)
- **Phase 4:** ~17.75 hours (Frontend)
- **Phase 5:** ~5.75 hours (Deployment)
- **Phase 6:** ~7.5 hours (Testing & Docs)
- **Phase 7:** ~6 hours (Polish)

**Total: ~54.25 hours**

---

## Getting Started

To begin implementation:

1. Start with **Phase 1** to set up the project structure
2. Complete **Phase 2** to establish the database foundation
3. Build **Phase 3** backend API endpoints incrementally
4. Implement **Phase 4** frontend features as backend becomes available
5. Test thoroughly in **Phase 6** before deployment
6. Complete **Phase 5** deployment scripts
7. Polish with **Phase 7** optimizations

## Success Criteria

The project is complete when:

- All API endpoints work correctly with OpenAPI docs
- Frontend allows full recipe and meal plan management
- CSV import successfully loads recipes
- Meal plan generation works
- Shopping list aggregates correctly
- Deployment scripts install successfully on Raspberry Pi
- Service runs reliably under systemd
- Documentation is complete and accurate

---

## Future Enhancements (Post-MVP)

- Recipe search and filtering
- Ingredient categorization for shopping list
- Recipe tags and dietary filters
- Nutritional information
- Multiple meal types (breakfast/lunch/dinner)
- Recipe ratings and favorites
- Photo upload for recipes
- Print-optimized views
- Weekly plan templates
- Mobile PWA support