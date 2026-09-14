#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { assessReviewStatus, validateEvidencePackage } from "./index.js";

function usage(): void {
  console.error("Usage: agent-evidence-kit validate <evidence.json>");
}

async function main(): Promise<void> {
  const [command, file] = process.argv.slice(2);
  if (command !== "validate" || !file) {
    usage();
    process.exitCode = 2;
    return;
  }
  let input: unknown;
  try {
    input = JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    console.error(`Could not read valid JSON from ${file}: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
    return;
  }
  const result = validateEvidencePackage(input);
  if (!result.success) {
    console.error("Invalid evidence package:");
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Valid evidence package. Suggested review status: ${assessReviewStatus(result.data)}`);
}

void main();
