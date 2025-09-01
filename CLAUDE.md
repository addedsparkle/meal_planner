# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Runs Next.js development server on port 3000
- **Production build**: `npm run build` - Creates optimized production build
- **Type checking**: `npm run type-check` - Runs TypeScript compiler without emitting files
- **Linting**: `npm run lint` - Runs ESLint to check code quality and style
- **Linting with fixes**: `npm run lint:fix` - Runs ESLint and automatically fixes issues
- **Code formatting**: `npm run format` - Formats code using Prettier

## Project Architecture

This is a Next.js 15 meal planning application built with TypeScript and React. The app allows users to manage recipes, generate weekly meal plans, and create shopping lists from those plans.

### Core Structure

- **Pages Router**: Uses Next.js pages directory structure (`pages/_app.tsx`, `pages/index.tsx`)
- **Component Architecture**: React components in `/components` directory with TypeScript
- **Type System**: Comprehensive TypeScript types in `/types` directory
- **Business Logic**: Core functions in `/lib` directory for meal planning and shopping list generation

### Key Types

- `Recipe`: Contains id, name, ingredients array, and instructions
- `WeekPlan`: Array of `DayPlan` objects representing a 7-day meal schedule
- `DayPlan`: Links a day of the week to a specific recipe
- `Ingredient`: Shopping list items with count, associated recipes, and days

### State Management

The main page (`pages/index.tsx`) manages application state using React hooks:
- Recipes collection
- Current week's meal plan
- Generated shopping list (using Map<string, Ingredient>)

### Styling

- **Tailwind CSS 4.x**: Utility-first CSS framework configured via PostCSS
- **Lucide React**: Icon library used for UI elements
- **Design Pattern**: Card-based layout with rounded corners, shadows, and color-coded sections

### Key Features

1. **Recipe Management**: Add, view, and delete recipes
2. **Meal Plan Generation**: Random assignment of recipes to days of the week
3. **Shopping List Generation**: Automatic ingredient aggregation from meal plans
4. **Interactive Components**: Replace recipes in meal plan, remove items from shopping list

### Path Aliases

Configured in `tsconfig.json`:
- `@/*` - Project root
- `@/components/*` - Components directory  
- `@/types/*` - Type definitions
- `@/styles/*` - Stylesheet directory

### Deployment

- **Platform**: Netlify with `@netlify/plugin-nextjs`
- **Build Output**: `.next` directory (configured in `netlify.toml`)
- **Node Version**: v18 (specified in `.nvmrc`)