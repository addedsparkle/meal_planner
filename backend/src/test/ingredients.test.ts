import { describe, it, expect } from "vitest";
import { getApp } from "./setup.js";

describe("Ingredients API", () => {
  it("GET /api/ingredients returns empty list", async () => {
    const app = await getApp();
    const res = await app.inject({ method: "GET", url: "/api/ingredients" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it("POST /api/ingredients creates an ingredient", async () => {
    const app = await getApp();
    const res = await app.inject({
      method: "POST",
      url: "/api/ingredients",
      payload: { name: "Salt", category: "Spice" },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.name).toBe("salt");
    expect(body.category).toBe("Spice");
    expect(body.id).toBeDefined();
  });

  it("POST /api/ingredients returns 409 for duplicate", async () => {
    const app = await getApp();
    await app.inject({
      method: "POST",
      url: "/api/ingredients",
      payload: { name: "Pepper" },
    });
    const res = await app.inject({
      method: "POST",
      url: "/api/ingredients",
      payload: { name: "Pepper" },
    });
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toContain("already exists");
  });

  it("GET /api/ingredients lists all ingredients", async () => {
    const app = await getApp();
    await app.inject({
      method: "POST",
      url: "/api/ingredients",
      payload: { name: "Flour" },
    });
    await app.inject({
      method: "POST",
      url: "/api/ingredients",
      payload: { name: "Sugar" },
    });

    const res = await app.inject({ method: "GET", url: "/api/ingredients" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(2);
  });

  it("GET /api/ingredients?search= filters by name", async () => {
    const app = await getApp();
    await app.inject({
      method: "POST",
      url: "/api/ingredients",
      payload: { name: "Olive Oil" },
    });
    await app.inject({
      method: "POST",
      url: "/api/ingredients",
      payload: { name: "Butter" },
    });

    const res = await app.inject({
      method: "GET",
      url: "/api/ingredients?search=olive",
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(1);
    expect(res.json()[0].name).toBe("olive oil");
  });

  it("PUT /api/ingredients/:id updates an ingredient", async () => {
    const app = await getApp();
    const created = await app.inject({
      method: "POST",
      url: "/api/ingredients",
      payload: { name: "Butter", category: "Dairy" },
    });
    const id = created.json().id;

    const res = await app.inject({
      method: "PUT",
      url: `/api/ingredients/${id}`,
      payload: { name: "Unsalted Butter", category: "Dairy" },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().name).toBe("unsalted butter");
  });

  it("PUT /api/ingredients/:id returns 404 for missing", async () => {
    const app = await getApp();
    const res = await app.inject({
      method: "PUT",
      url: "/api/ingredients/9999",
      payload: { name: "Nope" },
    });
    expect(res.statusCode).toBe(404);
  });

  it("DELETE /api/ingredients/:id deletes an ingredient", async () => {
    const app = await getApp();
    const created = await app.inject({
      method: "POST",
      url: "/api/ingredients",
      payload: { name: "Cinnamon" },
    });
    const id = created.json().id;

    const res = await app.inject({
      method: "DELETE",
      url: `/api/ingredients/${id}`,
    });
    expect(res.statusCode).toBe(204);
  });

  it("DELETE /api/ingredients/:id returns 409 when in use", async () => {
    const app = await getApp();
    // Create a recipe with an ingredient
    const recipe = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: {
        name: "Test Recipe",
        ingredients: [{ name: "Garlic", quantity: "3 cloves" }],
      },
    });
    const ingredientId = recipe.json().ingredients[0].id;

    const res = await app.inject({
      method: "DELETE",
      url: `/api/ingredients/${ingredientId}`,
    });
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toContain("used in recipes");
  });

  it("DELETE /api/ingredients/:id returns 404 for missing", async () => {
    const app = await getApp();
    const res = await app.inject({
      method: "DELETE",
      url: "/api/ingredients/9999",
    });
    expect(res.statusCode).toBe(404);
  });
});
