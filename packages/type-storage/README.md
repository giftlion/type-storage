# @giftlion/type-storage

Small TypeScript library inspired by trpc/drizzle api that provides a tiny, typesafe in-memory DB with a per-table `localStorage` backing. It uses `zod` for schema declaration and runtime typing.

Usage

Installation

```shell
npm i @giftlion/type-storage

```

The library is designed to run in a browser environment where `localStorage` exists. Minimal example:

```ts
import { createClient } from " @giftlion/type-storage";
import { z } from "zod";

const schema = z.object({
  users: z.object({ id: z.number(), name: z.string() }),
});

const db = createClient("app-db", { schema });

db.tables.users.insert({ id: 1, name: "Alice" });
console.log(db.tables.users.query().all());
```
