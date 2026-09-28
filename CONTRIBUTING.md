# Contributing to agent-evidence-kit

Thanks for considering a contribution.

agent-evidence-kit is intended to stay small, generic, and useful to AI research systems that need explicit provenance and fail-closed validation.

## Development

```sh
npm install
npm run typecheck
npm test
npm run build
```

Please include or update tests for behavioural changes.

## Design principles

- Keep evidence explicitly linked to its source.
- Prefer fail-closed validation for malformed or incomplete packages.
- Keep the library generic rather than adding Story Scotland-specific research logic.
- Do not commit private sources, datasets, credentials, or personal information.
- Keep schemas and validation behaviour backwards-compatible where practical.

## Pull requests

A focused pull request is easier to review than a broad refactor. Please explain what changes, why it is useful, and any compatibility implications.

Bug reports and feature proposals are welcome through GitHub Issues.
