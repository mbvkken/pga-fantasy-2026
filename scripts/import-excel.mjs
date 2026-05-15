/**
 * Usage: npm run import:teams -- "/path/to/file.xlsx"
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

function toSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: npm run import:teams -- <path-to-xlsx>");
  process.exit(1);
}

const workbook = XLSX.readFile(resolve(inputPath));
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

const participants = rows
  .filter((row) => row.Name)
  .map((row) => {
    const picks = [];
    for (let group = 1; group <= 7; group += 1) {
      const golfer = row[`Pot ${group} Name`];
      if (golfer) picks.push({ group, golfer: String(golfer).trim() });
    }
    return {
      id: toSlug(String(row.Name)),
      name: String(row.Name).trim(),
      picks,
    };
  });

const output = {
  tournament: "PGA Championship 2026",
  importedAt: new Date().toISOString(),
  source: inputPath,
  participants,
};

const outPath = resolve("data/teams.json");
writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${participants.length} participants to ${outPath}`);
