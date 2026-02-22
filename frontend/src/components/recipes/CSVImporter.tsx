import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "../ui/Button";
import { ErrorMessage } from "../ui/ErrorMessage";
import { useImportRecipesCsv } from "../../hooks/useRecipes";
import type { CsvImportResult, CsvImportError } from "../../lib/types";

interface CSVImporterProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CSVImporter({ onSuccess, onCancel }: CSVImporterProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const importCsv = useImportRecipesCsv();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResult(null);
  }

  async function handleUpload() {
    if (!file) return;
    try {
      const res = await importCsv.mutateAsync(file);
      setResult(res);
    } catch {
      // error shown via importCsv.error
    }
  }

  const done = result !== null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">
        Upload a CSV file to bulk-import recipes. Required column:{" "}
        <code className="rounded bg-gray-100 px-1 text-xs">name</code>. Optional columns:{" "}
        <code className="rounded bg-gray-100 px-1 text-xs">description</code>,{" "}
        <code className="rounded bg-gray-100 px-1 text-xs">protein</code>,{" "}
        <code className="rounded bg-gray-100 px-1 text-xs">meal_types</code>,{" "}
        <code className="rounded bg-gray-100 px-1 text-xs">freezable</code>,{" "}
        <code className="rounded bg-gray-100 px-1 text-xs">ingredients</code>{" "}
        (comma-separated, e.g.{" "}
        <code className="rounded bg-gray-100 px-1 text-xs">"Garlic (2 cloves),Olive oil"</code>).
      </p>

      {/* Drop zone / file picker */}
      {!done && (
        <div
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-10 text-center transition-colors hover:border-blue-400 hover:bg-blue-50"
          onClick={() => fileRef.current?.click()}
        >
          <FileText className="h-8 w-8 text-gray-400" />
          {file ? (
            <span className="text-sm font-medium text-gray-700">{file.name}</span>
          ) : (
            <span className="text-sm text-gray-500">Click to select a CSV file</span>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Result */}
      {done && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm">
          <p className="font-semibold text-green-800">Import complete</p>
          <ul className="mt-1 space-y-0.5 text-green-700">
            <li>Recipes created: {result.created}</li>
            <li>Skipped (duplicates): {result.skipped}</li>
          </ul>
          {result.errors.length > 0 && (
            <div className="mt-3">
              <p className="font-medium text-amber-700">Warnings ({result.errors.length})</p>
              <ul className="mt-1 space-y-1 text-xs text-amber-600">
                {result.errors.map((err: CsvImportError, i) => (
                  <li key={i}>• Row {err.row}: {err.error}{err.name ? ` (${err.name})` : ""}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {importCsv.error && <ErrorMessage error={importCsv.error} />}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>
          {done ? "Close" : "Cancel"}
        </Button>
        {!done && (
          <Button onClick={handleUpload} loading={importCsv.isPending} disabled={!file}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
        )}
        {done && <Button onClick={onSuccess}>Done</Button>}
      </div>
    </div>
  );
}
