# @repo/typesafe

Small TypeScript library that provides a tiny, typesafe in-memory DB with a per-table `localStorage` backing. It uses `zod` for schema declaration and runtime typing.

Key exports

- `createClient(name, { schema })` — factory to create a `DB` instance.
- `DB` — main class, exposes `tables` keyed by schema keys. Each table supports `.query()`, `.insert()`, `.delete()` and `.update()`.
- `where`, `equal`, `contains`, `notEqual` — helper predicates for queries.

Table API (examples)

- query
  - `db.tables.users.query().all()` — returns all rows
  - `db.tables.users.query().where(predicate)` — returns matched rows
- insert
  - `db.tables.users.insert(row)` — inserts and returns the row
- delete
  - `db.tables.users.delete().where(predicate)` — deletes and returns the deleted row
- update
  - `db.tables.users.update().where(predicate, changes)` — updates and returns the updated row

Browser usage

The library is designed to run in a browser environment where `localStorage` exists. Minimal example:

```ts
import { createClient } from "@repo/typesafe";
import { z } from "zod";

const schema = z.object({
  users: z.object({ id: z.number(), name: z.string() }),
});

const db = createClient("app-db", { schema });

db.tables.users.insert({ id: 1, name: "Alice" });
console.log(db.tables.users.query().all());
```

Node / Tests (jsdom or polyfill)

If you want to run the package in Node (for tests or scripts) you have two options:

1. Use Vitest's jsdom environment (recommended for tests):

```powershell
pnpm --filter @repo/typesafe test -- --environment jsdom
```

2. Provide a simple `localStorage` polyfill for quick scripts in Node. This example uses a tiny in-memory polyfill:

```ts
// localStorage polyfill (node)
globalThis.localStorage = (function () {
  const store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key)
        ? store[key]
        : null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      for (const k of Object.keys(store)) delete store[k];
    },
  } as Storage;
})();

// Then import and use the library as normal
import { createClient } from "@repo/typesafe";
import { z } from "zod";

const schema = z.object({
  users: z.object({ id: z.number(), name: z.string() }),
});
const db = createClient("node-db", { schema });
db.tables.users.insert({ id: 1, name: "NodeUser" });
console.log(db.tables.users.query().all());
```

Testing notes

- The tests in `packages/typesafe/tests.test.ts` are written for Vitest and expect a DOM-like `localStorage`. Either run the tests with `--environment jsdom` or add a polyfill in your test setup.

Development

- The package uses TypeScript and exports `index.ts` as source. Build or compile via your usual workspace tooling (pnpm/turborepo) if you need compiled artifacts.

Contributing

- Send PRs, add tests, and keep the code small and focused. Consider extracting storage adapters (memory, localStorage, IndexedDB) if you need more environments.
