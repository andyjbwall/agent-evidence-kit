import { assessReviewStatus, validateEvidencePackage } from "agent-evidence-kit";
import { readFile } from "node:fs/promises";

// Treat an agent response as unknown until it is validated.
const agentOutput: unknown = JSON.parse(await readFile("agent-output.json", "utf8"));
const validation = validateEvidencePackage(agentOutput);

if (!validation.success) {
  console.error("Rejected agent output:", validation.errors);
  process.exit(1);
}

const suggestedStatus = assessReviewStatus(validation.data);
if (suggestedStatus === "quarantined") {
  throw new Error("Do not publish quarantined research output.");
}

console.log({ claim: validation.data.claim.text, suggestedStatus });
