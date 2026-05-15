/**
 * Import golfer fantasy points from the league Excel "Leaderboard" sheet.
 * Usage: npm run import:positions -- "/path/to/Etter R1.xlsx"
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: npm run import:positions -- <path-to-xlsx>");
  process.exit(1);
}

const workbook = XLSX.readFile(resolve(inputPath));
const sheet = workbook.Sheets.Leaderboard ?? workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet).filter((row) => row.Golfer);

const golfers = rows.map((row) => ({
  name: String(row.Golfer).trim(),
  points: Number(row["Position (til oppslag)"] ?? row.Position),
}));

const output = {
  source: inputPath,
  importedAt: new Date().toISOString(),
  note: "Reference points from league spreadsheet; live app uses ESPN + position cap 67.",
  golfers,
};

const outPath = resolve("data/golfer-positions.json");
writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${golfers.length} golfer positions to ${outPath}`);
