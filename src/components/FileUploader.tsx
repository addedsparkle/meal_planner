import { Button, Dialog, DialogTrigger, FileTrigger } from "react-aria-components";
import type { RecipeIn } from "../types/Recipe";
import { useEffect, useState } from "react";
import { UploadIcon } from "lucide-react";


import { Modal } from "./Modal";
import { parseContents } from "../lib/parser";


export const FileUploader = ({
  addRecipes,
}: {
  addRecipes: (recipes: RecipeIn[]) => void;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<RecipeIn[]>([]);

  useEffect(() => {
    if (file) { void parseContents(file).then((recipes => {setContent(recipes)}))}
  },[file])

  return (
    <DialogTrigger>
      <Button>
        <UploadIcon />
      </Button>
      <Modal isDismissable>
        <Dialog className="p-5">
      <FileTrigger acceptedFileTypes={['application/json', 'text/csv', '.csv']} onSelect={(e) => {
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
