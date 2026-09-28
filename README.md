# agent-evidence-kit

A small TypeScript library for recording the provenance behind AI-generated research claims. It validates that claims have sources and that evidence snippets link to those sources, so research systems do not silently accept unsupported output.

Developed from provenance and verification patterns used in Story Scotland, an AI-assisted historical research and travel project.

## Install

```sh
npm install agent-evidence-kit zod
```

## Use

```ts
import { assessReviewStatus, validateEvidencePackage } from "agent-evidence-kit";

const result = validateEvidencePackage({
  claim: { id: "claim-42", text: "Example claim." },
  confidence: 0.9,
  sources: [
    { id: "report", url: "https://example.org/report", title: "Example report" },
    { id: "archive", url: "https://example.org/archive", title: "Example archive" }
  ],
  evidence: [
    { sourceId: "report", snippet: "A relevant passage." },
    { sourceId: "archive", snippet: "An independently relevant passage." }
  ],
  createdAt: new Date().toISOString(),
  agent: "research-agent/1.0",
  reviewStatus: "review"
});

if (!result.success) {
  console.error(result.errors);
} else {
  console.log(assessReviewStatus(result.data)); // accepted
}
```

`validateEvidencePackage()` is fail-closed: it rejects missing required fields, invalid values, duplicate source IDs, unlinked evidence, and unexpected fields. Errors include their field path.

`assessReviewStatus()` returns `accepted` only for a valid package with confidence of at least 0.8 and evidence linked to at least two sources. Other valid packages return `review`; invalid packages return `quarantined`.

## CLI

After installation or with `npx`, validate a JSON file:

```sh
npx agent-evidence-kit validate evidence.json
```

## Package structure

- `src/index.ts` — schemas, types, and validation helpers
- `src/cli.ts` — JSON validation command
- `examples/` — evidence capture and agent-output validation
- `test/` — unit tests

## Development

```sh
npm install
npm run typecheck
npm test
npm run build
```

## Contributing

Issues and pull requests are welcome. Please add or update tests for behavioural changes and keep the package generic: do not include private sources, datasets, credentials, or project-specific research logic.

## Licence

[MIT](LICENSE)
