import { describe, it, expect } from "vitest";
import { getApp, db } from "./setup.js";
import { ingredients } from "../db/schema.js";

describe("Recipes API", () => {
  it("GET /api/recipes returns empty list", async () => {
    const app = await getApp();
    const res = await app.inject({ method: "GET", url: "/api/recipes" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it("POST /api/recipes creates a recipe", async () => {
    const app = await getApp();
    const res = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: {
        name: "Pasta Carbonara",
        description: "Classic Italian pasta",
        servings: 4,
        prepTime: 10,
        cookTime: 20,
        instructions: "Cook pasta. Add sauce.",
        ingredients: [
          { name: "Pasta", quantity: "500g" },
          { name: "Eggs", quantity: "3" },
        ],
      },
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.name).toBe("Pasta Carbonara");
    expect(body.servings).toBe(4);
    expect(body.ingredients).toHaveLength(2);
    expect(body.ingredients[0].name).toBe("pasta");
    expect(body.ingredients[0].quantity).toBe("500g");
  });

  it("POST /api/recipes returns 400 for missing name", async () => {
    const app = await getApp();
    const res = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { description: "No name provided" },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBeDefined();
  });

  it("GET /api/recipes returns populated list", async () => {
    const app = await getApp();
    await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Recipe A" },
    });
    await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Recipe B" },
    });

    const res = await app.inject({ method: "GET", url: "/api/recipes" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveLength(2);
  });

  it("GET /api/recipes/:id returns a recipe", async () => {
    const app = await getApp();
    const created = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Test Recipe" },
    });
    const id = created.json().id;

    const res = await app.inject({ method: "GET", url: `/api/recipes/${id}` });
    expect(res.statusCode).toBe(200);
    expect(res.json().name).toBe("Test Recipe");
  });

  it("GET /api/recipes/:id returns 404 for missing recipe", async () => {
    const app = await getApp();
    const res = await app.inject({ method: "GET", url: "/api/recipes/9999" });
    expect(res.statusCode).toBe(404);
  });

  it("PUT /api/recipes/:id updates a recipe", async () => {
    const app = await getApp();
    const created = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "Original", servings: 2 },
    });
    const id = created.json().id;

    const res = await app.inject({
      method: "PUT",
      url: `/api/recipes/${id}`,
      payload: { name: "Updated", servings: 4 },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().name).toBe("Updated");
    expect(res.json().servings).toBe(4);
  });

  it("PUT /api/recipes/:id updates ingredients", async () => {
    const app = await getApp();
    const created = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: {
        name: "Salad",
        ingredients: [{ name: "Lettuce", quantity: "1 head" }],
      },
    });
    const id = created.json().id;

    const res = await app.inject({
      method: "PUT",
      url: `/api/recipes/${id}`,
      payload: {
        ingredients: [
          { name: "Spinach", quantity: "200g" },
          { name: "Tomato", quantity: "2" },
        ],
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().ingredients).toHaveLength(2);
    expect(res.json().ingredients[0].name).toBe("spinach");
  });

  it("PUT /api/recipes/:id returns 404 for missing recipe", async () => {
    const app = await getApp();
    const res = await app.inject({
      method: "PUT",
      url: "/api/recipes/9999",
      payload: { name: "Nope" },
    });
    expect(res.statusCode).toBe(404);
  });

  it("DELETE /api/recipes/:id deletes a recipe", async () => {
    const app = await getApp();
    const created = await app.inject({
      method: "POST",
      url: "/api/recipes",
      payload: { name: "To Delete" },
    });
    const id = created.json().id;

    const res = await app.inject({ method: "DELETE", url: `/api/recipes/${id}` });
    expect(res.statusCode).toBe(204);

    const check = await app.inject({ method: "GET", url: `/api/recipes/${id}` });
    expect(check.statusCode).toBe(404);
  });

  it("DELETE /api/recipes/:id returns 404 for missing recipe", async () => {
    const app = await getApp();
    const res = await app.inject({ method: "DELETE", url: "/api/recipes/9999" });
    expect(res.statusCode).toBe(404);
  });

  it("POST /api/recipes/import imports from CSV", async () => {
    const app = await getApp();
    const csv = `name,description,servings,ingredients
Tacos,Delicious tacos,4,beef (500g)|tortilla (8)|cheese (200g)
Soup,Warm soup,2,chicken (300g)|carrot (3)`;

    const form = new FormData();
    form.append("file", new Blob([csv], { type: "text/csv" }), "recipes.csv");

    // Use raw injection with multipart boundary
    const boundary = "----TestBoundary";
    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="recipes.csv"',
      "Content-Type: text/csv",
      "",
      csv,
      `--${boundary}--`,
    ].join("\r\n");

    const res = await app.inject({
      method: "POST",
      url: "/api/recipes/import",
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: body,
    });
    expect(res.statusCode).toBe(200);
    const result = res.json();
    expect(result.created).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it("POST /api/recipes/import handles missing name", async () => {
    const app = await getApp();
    const csv = `name,description
,No name here`;

    const boundary = "----TestBoundary";
    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="file"; filename="recipes.csv"',
      "Content-Type: text/csv",
      "",
      csv,
      `--${boundary}--`,
    ].join("\r\n");

    const res = await app.inject({
      method: "POST",
      url: "/api/recipes/import",
      headers: {
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      payload: body,
    });
    expect(res.statusCode).toBe(200);
    const result = res.json();
    expect(result.created).toBe(0);
    expect(result.skipped).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].error).toBe("Missing recipe name");
  });
});
