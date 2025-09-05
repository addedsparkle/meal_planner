import { Button, Dialog, DialogTrigger, FileTrigger } from "react-aria-components";
import type { Recipe } from "../types/Recipe";
import { useEffect, useState } from "react";
import { UploadIcon } from "lucide-react";

import { Modal } from "./Modal";
export const FileUploader = ({
  addRecipes,
}: {
  addRecipes: (recipes: Recipe[]) => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<Recipe[]>([]);


  useEffect(() => {
    async function parseContents(file:File): Promise<void> {
      const content = await file.text();
      const recipesToAdd: Recipe[] = JSON.parse(content) as Recipe[];
      setContent(recipesToAdd);
    }
    if (file) { void parseContents(file)}
  },[file])

  return (
    <DialogTrigger>
      <Button>
        <UploadIcon />
      </Button>
      <Modal isDismissable>
        <Dialog className="p-5">
      <FileTrigger acceptedFileTypes={['application/json']} onSelect={(e) => {
          const files = e ? Array.from(e) : [];
          setFile(files[0])}}>
        <Button className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-blue-700">Select file</Button>
      </FileTrigger>

      {file && (
        <>
          <p>Load {content.length} recipes?</p>
          <Button
            slot="close"
            onClick={() => {
              addRecipes(content);
              setContent([]);
              setFile(null)
            }}
            className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Recipes
          </Button>
        </>
      )}
              </Dialog>
            </Modal>
          </DialogTrigger>

  );
};
