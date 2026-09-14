import { z, ZodError } from "zod";

export const ReviewStatusSchema = z.enum(["accepted", "review", "quarantined"]);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

export const ClaimSchema = z.object({
  id: z.string().min(1).max(200).optional(),
  text: z.string().min(1, "Claim text is required").max(20_000)
}).strict();
export type Claim = z.infer<typeof ClaimSchema>;

export const SourceSchema = z.object({
  id: z.string().min(1, "Source id is required").max(200),
  url: z.string().url("Source URL must be a valid URL"),
  title: z.string().min(1).max(1_000).optional(),
  publisher: z.string().min(1).max(500).optional(),
  accessedAt: z.string().datetime({ offset: true }).optional()
}).strict();
export type Source = z.infer<typeof SourceSchema>;

export const EvidenceSchema = z.object({
  sourceId: z.string().min(1, "Evidence must name a source"),
  snippet: z.string().min(1, "Evidence snippet is required").max(20_000),
  locator: z.string().min(1).max(1_000).optional(),
  notes: z.string().min(1).max(5_000).optional()
}).strict();
export type Evidence = z.infer<typeof EvidenceSchema>;

export const EvidencePackageSchema = z.object({
  claim: ClaimSchema,
  confidence: z.number().min(0).max(1),
  sources: z.array(SourceSchema).min(1, "At least one source is required"),
  evidence: z.array(EvidenceSchema).min(1, "At least one evidence snippet is required"),
  createdAt: z.string().datetime({ offset: true }),
  agent: z.string().min(1).max(500).optional(),
  reviewStatus: ReviewStatusSchema,
  reviewerNotes: z.string().min(1).max(10_000).optional()
}).strict();
export type EvidencePackage = z.infer<typeof EvidencePackageSchema>;

export type EvidenceValidationResult =
  | { success: true; data: EvidencePackage }
  | { success: false; errors: string[] };

function formatIssues(error: ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.join(".") : "package";
    return `${path}: ${issue.message}`;
  });
}

/**
 * Validates an unknown value as a complete provenance package. Validation is
 * fail-closed: malformed data, duplicate source IDs, and unlinked evidence are
 * rejected rather than inferred or silently discarded.
 */
export function validateEvidencePackage(input: unknown): EvidenceValidationResult {
  const parsed = EvidencePackageSchema.safeParse(input);
  if (!parsed.success) return { success: false, errors: formatIssues(parsed.error) };

  const sourceIds = new Set<string>();
  const errors: string[] = [];
  for (const source of parsed.data.sources) {
    if (sourceIds.has(source.id)) errors.push(`sources: duplicate source id '${source.id}'`);
    sourceIds.add(source.id);
  }
  for (const [index, item] of parsed.data.evidence.entries()) {
    if (!sourceIds.has(item.sourceId)) {
      errors.push(`evidence.${index}.sourceId: no source exists with id '${item.sourceId}'`);
    }
  }
  return errors.length ? { success: false, errors } : { success: true, data: parsed.data };
}

/**
 * Applies a conservative default review decision. Invalid input is quarantined;
 * well-formed, independently supported high-confidence claims are accepted.
 */
export function assessReviewStatus(input: unknown): ReviewStatus {
  const result = validateEvidencePackage(input);
  if (!result.success) return "quarantined";
  const { confidence, sources, evidence, reviewStatus } = result.data;
  if (reviewStatus === "quarantined") return "quarantined";
  const linkedSources = new Set(evidence.map((item) => item.sourceId));
  if (confidence >= 0.8 && sources.length >= 2 && linkedSources.size >= 2) return "accepted";
  return "review";
}
