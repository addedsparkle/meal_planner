# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo with the following structure:
- **`/frontend`**: React-based web application
- **`/netlify`**: Netlify serverless functions (if applicable)

## Development Commands

All commands should be run from the root directory:

- **Development server**: `npm run dev` - Starts Vite dev server with hot reload (runs in frontend)
- **Build**: `npm run build` - TypeScript compilation followed by Vite build (runs in frontend)
- **Linting**: `npm run lint` - ESLint with strict TypeScript rules (runs in frontend)
- **Code formatting**: `npm run format` - Prettier formatting for JS/TS/JSON files (runs in frontend)
- **Preview**: `npm run preview` - Preview production build locally (runs in frontend)
- **Install frontend dependencies**: `npm run install:frontend` - Install dependencies in frontend folder

## Architecture Overview

This is a React-based meal planning application built with Vite, TypeScript, and Tailwind CSS using React Aria Components for UI primitives.

### Frontend Structure (`/frontend`)

#### Core Data Flow
- **Recipe Management**: Recipes are managed in `App.tsx` state and can be added manually via form or imported from files
- **Meal Plan Generation**: `lib/mealPlan.ts` generates weekly plans by randomly assigning recipes to days
- **Shopping List**: `lib/generateShoppingList.ts` aggregates ingredients from meal plans, tracking which recipes/days need each ingredient
- **Recipe Export**: `lib/exportRecipes.ts` handles recipe data export functionality

#### Key Type Definitions
- `Recipe`: Core recipe entity with id, name, and ingredients array
- `WeekPlan`: Array of `DayPlan` objects mapping days to recipes
- `Ingredient`: Shopping list items with usage tracking across recipes and days
- `Day`: Union type for weekday strings

#### Component Structure
- `App.tsx`: Main application state and layout
- `AddRecipeForm`: Modal-based recipe creation
- `FileUploader`: Recipe import functionality
- `MealPlan`: Weekly meal plan display with recipe replacement
- `ShoppingList`: Interactive shopping list with item removal
- `RecipeList`: Recipe management and display

### Technology Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **Styling**: Tailwind CSS v4 with React Aria Components
- **Linting**: ESLint with strict TypeScript rules
- **Icons**: Lucide React

### State Management
Application uses React useState for all state management. Key state includes:
- Recipe collection in main App component
- Generated meal plans (WeekPlan type)
- Shopping lists as Map<string, Ingredient>
- No external state management library is used