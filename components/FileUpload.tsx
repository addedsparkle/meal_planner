import { Recipe } from "@/types/Recipe";
import React, { useState } from "react";

const SingleFileUploader = ({
  addRecipes,
}: {
  addRecipes: (recipes: Recipe[]) => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<Recipe[]>([]);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      const content = await e.target.files[0].text();
      const recipesToAdd: Recipe[] = JSON.parse(content);
      setContent(recipesToAdd);
    }
  };

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
          <button onClick={() => addRecipes(content)}>Add Recipes</button>
        </>
      )}
    </>
  );
};

export default SingleFileUploader;
