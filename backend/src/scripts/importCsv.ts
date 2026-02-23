import { readFileSync } from "fs";
import { resolve } from "path";
import { db } from "../db/index.js";
import { importRecipesFromCsv } from "../services/csvImportService.js";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: npm run import:csv -- <path-to-csv>");
  process.exit(1);
}

const absolutePath = resolve(filePath);

let csvContent: string;
try {
  csvContent = readFileSync(absolutePath, "utf8");
} catch {
  console.error(`Error: could not read file "${absolutePath}"`);
  process.exit(1);
}

const result = await importRecipesFromCsv(db, csvContent);

console.log(`Imported:  ${result.created}`);
console.log(`Skipped:   ${result.skipped}`);

if (result.errors.length > 0) {
  console.log("\nErrors:");
  for (const err of result.errors) {
    console.log(`  Row ${err.row} "${err.name}": ${err.error}`);
  }
}
