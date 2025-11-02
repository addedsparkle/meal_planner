# Meal Planner

A React-based meal planning application that helps you organize recipes, generate weekly meal plans, and create shopping lists.

## Project Structure

This is a monorepo with the following structure:

- **`/frontend`**: React web application (Vite + TypeScript + React)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```bash
   npm run install:frontend
   ```
   Or navigate to the frontend folder:
   ```bash
   cd frontend
   npm install
   ```

### Development

Run the development server from the root directory:

```bash
npm run dev
```

This will start the Vite dev server with hot module replacement at http://127.0.0.1:5173

### Building for Production

Build the application from the root directory:

```bash
npm run build
```

The production build will be output to `frontend/dist`

### Other Commands

- **Lint**: `npm run lint` - Run ESLint
- **Format**: `npm run format` - Format code with Prettier
- **Preview**: `npm run preview` - Preview production build
- **Test**: `npm run test` - Run tests with Vitest
- **Test UI**: `npm run test:ui` - Run tests with Vitest UI

## Technology Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite with SWC
- **Styling**: Tailwind CSS v4
- **UI Components**: React Aria Components
- **State Management**: React useState + TanStack Query

## Features

- Add and manage recipes
- Generate weekly meal plans
- Create shopping lists from meal plans
- Import/export recipes
- Track ingredient usage across recipes
