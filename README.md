# my-engine

Lightweight monorepo containing a tiny typesafe, localStorage-backed in-memory DB used for demos and tests.

This workspace contains a single package of interest for now:

- `packages/typesafe` — a small TypeScript library that exposes a `DB` and `Table` abstraction built on top of `localStorage` and `zod` schemas. It's useful for browser-focused demos and tests that rely on a DOM-like environment.

Files and folders

- `packages/typesafe` — the typesafe DB implementation and tests.
- `examples/typesafe` — a small Next.js example (mostly scaffolding).

Quick start

1. Install dependencies (pnpm workspace):

```powershell
pnpm install
```

2. Run the tests for the `typesafe` package (the tests require a DOM-like environment for `localStorage`):

```powershell
pnpm --filter @repo/typesafe test -- --environment jsdom
```

If you prefer running Vitest directly from the package folder:

```powershell
cd packages/typesafe
pnpm test -- --environment jsdom
```

Notes

- The `typesafe` package uses `localStorage` at runtime. For Node-based tests you must run in a DOM-like environment (Vitest's `jsdom`), or provide a `localStorage` polyfill (see `packages/typesafe/README.md` for examples).
- The library is intentionally tiny and demonstrates a pattern of coupling zod-validated schemas with a simple per-table storage layer.

See the package-specific README for API docs and usage examples:

packages/typesafe/README.md
