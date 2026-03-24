import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createDb } from "../db/index.js";
import { buildApp } from "../app.js";

const { db, close } = createDb(":memory:");
const app = await buildApp(db, { logger: false });
await app.ready();

const spec = app.swagger();

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, "../../openapi.json");
writeFileSync(outputPath, JSON.stringify(spec, null, 2));
console.log(`OpenAPI spec written to ${outputPath}`);

await app.close();
close();
