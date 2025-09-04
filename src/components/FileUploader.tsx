import type { Recipe } from "../types/Recipe";
import React, { useEffect, useState } from "react";

export const FileUploader = ({
  addRecipes,
}: {
  addRecipes: (recipes: Recipe[]) => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<Recipe[]>([]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  useEffect(() => {
    async function parseContents(file:File): Promise<void> {
      const content = await file.text();
      const recipesToAdd: Recipe[] = JSON.parse(content) as Recipe[];
      setContent(recipesToAdd);
    }
    if (file) { void parseContents(file)}
  },[file])

  return (
    <>
      <div className="input-group">
        <input id="file" type="file" onChange={handleFileChange} />
      </div>

      {file && (
        <>
          <dl>
            {content.map((recipe: Recipe) => (
              <>
                <dt>{recipe.name}</dt>
                <dd>{recipe.ingredients}</dd>
              </>
            ))}
          </dl>
          <button
            onClick={() => {
              addRecipes(content);
            }}
          >
            Add Recipes
          </button>
        </>
      )}
    </>
  );
};
