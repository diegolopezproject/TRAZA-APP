import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const roots = ["src/design-system/components", "src/design-system/patterns"];
function inspectLine(line) {
  const issues = [];
  if (/#[0-9a-f]{3,8}\b/i.test(line)) issues.push("color");
  const shadow = line.match(/box-shadow\s*:\s*([^;]+)/i)?.[1].trim();
  if (shadow && !shadow.startsWith("var(")) issues.push("shadow");
  const radius = line.match(/border-radius\s*:\s*([^;]+)/i)?.[1].trim();
  if (radius && !radius.includes("var(") && !/^0(?:\s+0)*$/.test(radius)) issues.push("radius");
  if (/(?:transition|animation)(?:-duration)?\s*:[^;]*(?:\dms|\d(?:\.\d+)?s)\b/i.test(line)) issues.push("duration");
  const layer = line.match(/z-index\s*:\s*([^;]+)/i)?.[1].trim();
  if (layer && !layer.startsWith("var(")) issues.push("layer");
  const spacing = line.match(/(?:padding|margin|gap)(?:-[a-z]+)?\s*:\s*([^;]+)/i)?.[1].trim();
  if (spacing && /(?:px|rem)\b/i.test(spacing) && !/(?:var|max|calc|clamp)\(/i.test(spacing)) issues.push("spacing");
  return issues;
}

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? filesIn(path.join(directory, entry.name)) : [path.join(directory, entry.name)]));
  return nested.flat().filter((file) => /\.(css|tsx?)$/.test(file));
}

const violations = [];
for (const root of roots) {
  for (const file of await filesIn(root)) {
    const source = await readFile(file, "utf8");
    source.split("\n").forEach((lineText, index) => {
      if (lineText.includes("token-gate-allow")) return;
      for (const issue of inspectLine(lineText)) violations.push(`${file}:${index + 1} ${issue}: ${lineText.trim()}`);
    });
  }
}

if (violations.length) {
  console.error("TRAZA token gate found hardcoded visual values:\n" + violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("TRAZA token gate passed: migrated Core and Patterns use semantic tokens.");
}
