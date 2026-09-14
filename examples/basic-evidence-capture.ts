import { assessReviewStatus, validateEvidencePackage } from "agent-evidence-kit";

const evidencePackage = {
  claim: { text: "The library has an MIT licence." },
  confidence: 0.95,
  sources: [{ id: "license", url: "https://opensource.org/license/mit/", title: "MIT License" }],
  evidence: [{ sourceId: "license", snippet: "Permission is hereby granted, free of charge..." }],
  createdAt: new Date().toISOString(),
  agent: "example-agent",
  reviewStatus: "review"
};

const result = validateEvidencePackage(evidencePackage);
if (!result.success) throw new Error(result.errors.join("\n"));

console.log(assessReviewStatus(result.data)); // "review": one source still deserves review
