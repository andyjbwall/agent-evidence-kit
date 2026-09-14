import { describe, expect, it } from "vitest";
import { assessReviewStatus, validateEvidencePackage } from "../src/index.js";

const validPackage = {
  claim: { id: "claim-1", text: "Example claim." },
  confidence: 0.9,
  sources: [
    { id: "source-a", url: "https://example.com/a", title: "Source A" },
    { id: "source-b", url: "https://example.com/b", title: "Source B" }
  ],
  evidence: [
    { sourceId: "source-a", snippet: "Supporting passage A." },
    { sourceId: "source-b", snippet: "Supporting passage B." }
  ],
  createdAt: "2026-01-15T12:00:00.000Z",
  agent: "research-agent/1.0",
  reviewStatus: "review"
};

describe("validateEvidencePackage", () => {
  it("accepts a complete linked package", () => {
    const result = validateEvidencePackage(validPackage);
    expect(result.success).toBe(true);
  });

  it("fails closed for evidence linked to no source", () => {
    const result = validateEvidencePackage({
      ...validPackage,
      evidence: [{ sourceId: "missing", snippet: "Unsupported." }]
    });
    expect(result).toEqual({
      success: false,
      errors: ["evidence.0.sourceId: no source exists with id 'missing'"]
    });
  });

  it("rejects incomplete and unexpected package data", () => {
    const result = validateEvidencePackage({ claim: { text: "A claim" }, confidence: 2, extra: true });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors).toContain("confidence: Number must be less than or equal to 1");
      expect(result.errors.some((error) => error.includes("sources"))).toBe(true);
      expect(result.errors.some((error) => error.includes("Unrecognized key(s)"))).toBe(true);
    }
  });
});

describe("assessReviewStatus", () => {
  it("accepts high-confidence claims with independent linked sources", () => {
    expect(assessReviewStatus(validPackage)).toBe("accepted");
  });

  it("routes lower-confidence packages to review", () => {
    expect(assessReviewStatus({ ...validPackage, confidence: 0.7 })).toBe("review");
  });

  it("quarantines invalid input", () => {
    expect(assessReviewStatus({ claim: { text: "No sources" } })).toBe("quarantined");
  });

  it("preserves an explicit quarantine decision", () => {
    expect(assessReviewStatus({ ...validPackage, reviewStatus: "quarantined" })).toBe("quarantined");
  });
});
