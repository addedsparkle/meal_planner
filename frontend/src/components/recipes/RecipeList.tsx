import { useState } from "react";
import { Plus } from "lucide-react";
import { RecipeCard } from "./RecipeCard";
import { RecipeDetail } from "./RecipeDetail";
import { RecipeForm } from "./RecipeForm";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { ErrorMessage } from "../ui/ErrorMessage";
import { useRecipes, useDeleteRecipe } from "../../hooks/useRecipes";
import type { Recipe } from "../../lib/types";

type ModalState =
  | { kind: "none" }
  | { kind: "view"; recipe: Recipe }
  | { kind: "create" }
  | { kind: "edit"; recipe: Recipe };

export function RecipeList() {
  const { data: recipes, isLoading, error } = useRecipes();
  const deleteRecipe = useDeleteRecipe();
  const [modal, setModal] = useState<ModalState>({ kind: "none" });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  function closeModal() {
    setModal({ kind: "none" });
  }

  async function handleDelete(recipe: Recipe) {
    if (!window.confirm(`Delete "${recipe.name}"? This cannot be undone.`)) return;
    setDeletingId(recipe.id);
    try {
      await deleteRecipe.mutateAsync(recipe.id);
      if (modal.kind === "view" && modal.recipe.id === recipe.id) closeModal();
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} className="mt-8" />;
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Recipes
          {recipes && recipes.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">({recipes.length})</span>
          )}
        </h2>
        <Button size="sm" onClick={() => setModal({ kind: "create" })}>
          <Plus className="h-4 w-4" />
          New Recipe
        </Button>
      </div>

      {/* Empty state */}
      {recipes?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <p className="text-gray-500">No recipes yet. Add your first recipe to get started.</p>
          <Button onClick={() => setModal({ kind: "create" })}>
            <Plus className="h-4 w-4" />
            Create Recipe
          </Button>
        </div>
      )}

      {/* Recipe grid */}
      {recipes && recipes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onView={(r) => setModal({ kind: "view", recipe: r })}
              onEdit={(r) => setModal({ kind: "edit", recipe: r })}
              onDelete={handleDelete}
              deleting={deletingId === recipe.id}
            />
          ))}
        </div>
      )}

      {/* View modal */}
      <Modal
        open={modal.kind === "view"}
        onClose={closeModal}
        title={modal.kind === "view" ? modal.recipe.name : ""}
        size="lg"
      >
        {modal.kind === "view" && (
          <RecipeDetail
            recipe={modal.recipe}
            onEdit={() => setModal({ kind: "edit", recipe: modal.recipe })}
            onClose={closeModal}
          />
        )}
      </Modal>

      {/* Create modal */}
      <Modal open={modal.kind === "create"} onClose={closeModal} title="New Recipe" size="xl">
        {modal.kind === "create" && (
          <RecipeForm onSuccess={closeModal} onCancel={closeModal} />
        )}
      </Modal>

      {/* Edit modal */}
      <Modal open={modal.kind === "edit"} onClose={closeModal} title="Edit Recipe" size="xl">
        {modal.kind === "edit" && (
          <RecipeForm recipe={modal.recipe} onSuccess={closeModal} onCancel={closeModal} />
        )}
      </Modal>
    </>
  );
}
