# Design: Prevent Recipe Repetition Across Meal Plans

**Date:** 2026-03-06
**Status:** Approved

## Problem

The meal plan generator already avoids repetition *within* a single plan (protein-based distribution, round-robin). However, each new plan generation starts fresh with a new random shuffle, so recently-used recipes can appear again at the start of the next plan.

## Goals

- Prioritize least-recently-used recipes during generation
- Show users when each recipe was last used
- Allow sorting the recipe list by last-used date

## Non-Goals

- Hard cooldown cutoffs that exclude recipes from generation
- Full usage history / analytics (deferred to a future phase)
- Per-user tracking (no auth in this app)

## Approach

### Data Layer

Add a `last_used_at` nullable text column (ISO date string) to the `recipes` table via a Drizzle migration.

**Write path:** After any meal plan create, update, or delete operation, recompute `last_used_at` for all affected recipes by querying `meal_plan_days`:

```sql
SELECT recipe_id, MAX(day_date) FROM meal_plan_days GROUP BY recipe_id
```

This makes `last_used_at` a reliable derived value — always consistent with actual plan history. Recipes no longer in any plan are set to `null`. This approach is edit-safe: removing a recipe from a plan correctly reflects its true last use from other plans.

**Future compatibility:** This is additive. A `recipe_usage_history` table can be added later without removing `last_used_at` (it would become a denormalized cache of the max from the history table).

### Generation Logic

Before distributing by protein, sort each meal type's recipe pool by `last_used_at` ascending (nulls first — never-used recipes are highest priority). Then apply existing protein distribution as before.

This replaces the random shuffle within protein groups with a deterministic LRU ordering. The effect: the generator always favors recipes that haven't been cooked in the longest time, and never fails due to having too few recipes.

No API changes to `POST /api/meal-plans/generate`.

### API

- Include `lastUsedAt` in the `GET /api/recipes` response (already on the table, just needs to be returned)
- Add optional `sortBy=lastUsedAt` and `order=asc|desc` query params to `GET /api/recipes`

### Frontend

**Recipe list page:**
- Display `lastUsedAt` on each recipe card as a human-readable relative date ("Used 3 days ago" / "Never used")
- Add "Last used" as a sortable option in the existing sort controls

**Recipe detail page:**
- Display `lastUsedAt` as a simple field ("Last used: March 3, 2026" / "Never used")

## Migration Path to Full History (Future)

1. Add `recipe_usage_history (recipe_id, used_date, meal_plan_id)` table
2. Backfill from existing `meal_plan_days`
3. Update write path to insert rows into both tables
4. `last_used_at` becomes a cache derived from the history table
