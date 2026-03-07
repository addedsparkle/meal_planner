# Design: No Recipe Repetition Within a Generated Meal Plan

**Date:** 2026-03-06
**Status:** Approved

## Problem

The meal plan generator maintains independent pools per meal type (breakfast, lunch, dinner). A recipe tagged with multiple meal types (e.g. `["lunch", "dinner"]`) can appear in both pools simultaneously, causing the same recipe to be scheduled on different days under different meal types — e.g. lunch Monday and dinner Tuesday.

## Goals

- A recipe should appear at most once in a generated meal plan, across all days and all meal types
- Best effort: maximise uniqueness; do not error when recipes are exhausted
- Leftovers fallback: when lunch has no unused recipes, prefer the previous day's dinner recipe

## Non-Goals

- Enforcing uniqueness on manually-created or manually-edited meal plans
- UI changes
- Schema or API changes

## Approach

### Global used-set with skip-ahead

Introduce a shared `usedIds: Set<number>` that is populated as slots are assigned, left-to-right across all meal types for each day (breakfast → lunch → dinner).

Replace the current `pool[i % pool.length]` index access with a `pickNext(pool, usedIds)` helper:

```
pickNext(pool, usedIds):
  scan pool in order for first recipe not in usedIds
  if found: add to usedIds, return it
  else: return null (pool exhausted)
```

When `pickNext` returns `null`:

- **Lunch slot**: scan `dayEntries` in reverse for the most recent dinner entry; reuse that recipe (leftovers). If no prior dinner exists, fall back to LRU wrap-around (allow repeat).
- **Breakfast / dinner slots**: allow repeat — pick `pool[wrapIndex % pool.length]` where `wrapIndex` increments independently per pool from where exhaustion occurred.

The existing protein-distribution (`distributeByProtein`) and LRU sorting (`sortByLRU`) are preserved — they still determine the order in which `pickNext` scans the pool.

### No schema or API changes

The change is entirely within `generateMealPlan` in `backend/src/services/mealPlanService.ts`.

## Testing

1. **Uniqueness test**: create enough recipes to fill all slots (e.g. 7 dinner + 7 lunch + 1 breakfast for a 7-day plan). Generate the plan. Assert no recipe ID appears more than once in `body.days`.

2. **Exhaustion / leftovers fallback test**: create fewer recipes than slots (e.g. 1 dinner recipe, 1 lunch recipe for a 3-day plan with both meal types). Generate the plan. Assert the generator does not error. Assert that when lunch recipes are exhausted, the repeated lunch recipe matches a previous dinner recipe.
