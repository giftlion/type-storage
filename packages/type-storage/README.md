# @giftlion/typed-storage

A lightweight, type-safe localStorage wrapper with a SQL-like query API for TypeScript and React applications.

## Features

- 🎯 **Fully Type-Safe** - Powered by Zod schemas with complete TypeScript inference
- 🔗 **Chainable Query API** - Intuitive `query().where().select()` syntax
- ⚡ **Reactive React Hooks** - Auto-sync your components with localStorage changes
- 🪶 **Lightweight** - Minimal bundle size with zero dependencies (except Zod)
- 🔄 **Cross-Tab Sync** - Automatically syncs data across browser tabs
- 🎨 **Familiar API** - Inspired by Drizzle ORM and tRPC

## Installation
```bash
npm install @giftlion/typed-storage zod
```

## Quick Start

### 1. Define Your Schema
```typescript
import { createClient } from "@giftlion/type-storage";
import { z } from "zod";

const schema = z.object({
  users: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
  }),
  posts: z.object({
    id: z.number(),
    title: z.string(),
    authorId: z.number(),
  }),
});

const db = createClient("my-app", { schema });
```

### 2. Basic CRUD Operations
```typescript
// Insert
db.users.insert({ id: 1, name: "Alice", email: "alice@example.com" });

// Query all
const { data: users } = db.users.query();

// Query with filter
const { data: activeUsers } = db.users
  .query()
  .where((user) => user.id > 10);

// Query with select
const { data: emails } = db.users
  .query()
  .select({ email: true });

// Chain where and select
const { data: filtered } = db.users
  .query()
  .where((user) => user.name.includes("Alice"))
  .select({ name: true, email: true });

// Update
db.users.update().where((user) => user.id === 1, { name: "Alice Updated" });

// Delete
db.users.delete().where((user) => user.id === 1);
```

## React Integration

### Real-time Data Sync

Use the `useLiveStorage` hook to automatically re-render components when data changes:
```typescript
import { useLiveStorage } from "@giftlion/typed-storage/react";
import { db } from "./db";

function UserList() {
  const { data: users } = useLiveStorage(() => db.users.query());

  return (
    <ul>
      {users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

function AddUser() {
  const handleAdd = () => {
    db.users.insert({
      id: Date.now(),
      name: "New User",
      email: "new@example.com",
    });
    // UserList component automatically updates!
  };

  return <button onClick={handleAdd}>Add User</button>;
}
```

## API Reference

### Query Methods

#### `query()`
Start a new query on a table.
```typescript
db.users.query()
```

#### `.where(predicate)`
Filter results based on a condition.
```typescript
db.users.query().where((user) => user.age > 18)
```

#### `.select(fields)`
Select specific fields from results.
```typescript
db.users.query().select({ name: true, email: true })
```

### Mutation Methods

#### `insert(item)`
Insert a single item.
```typescript
const { data, error } = db.users.insert({ id: 1, name: "Alice", email: "a@example.com" });
```

#### `insertMany(items)`
Insert multiple items.
```typescript
db.users.insertMany([
  { id: 1, name: "Alice", email: "a@example.com" },
  { id: 2, name: "Bob", email: "b@example.com" },
]);
```

#### `update().where(predicate, updates)`
Update items matching a condition.
```typescript
db.users.update().where(
  (user) => user.id === 1,
  { name: "Updated Name" }
);
```

#### `delete().where(predicate)`
Delete items matching a condition.
```typescript
db.users.delete().where((user) => user.id === 1);
```

#### `deleteMany().where(predicate)`
Delete multiple items.
```typescript
db.users.deleteMany().where((user) => user.age < 18);
```

### Helper Functions
```typescript
import { equal, contains, notEqual } from "@giftlion/typed-storage";

// Exact match
db.users.query().where(equal({ id: 1 }))

// Contains substring
db.users.query().where(contains({ name: "Alice" }))

// Not equal
db.users.query().where(notEqual({ status: "inactive" }))
```

## Advanced Usage

### Chaining Queries
```typescript
const { data } = db.users
  .query()
  .where((u) => u.age > 18)
  .select({ name: true, email: true })
  .where((u) => u.email.includes("@gmail.com"));
```

### Working with Nested Data
```typescript
const schema = z.object({
  users: z.object({
    id: z.number(),
    name: z.string(),
    profile: z.object({
      bio: z.string(),
      avatar: z.string(),
    }),
  }),
});

const db = createClient("app", { schema });

db.users.insert({
  id: 1,
  name: "Alice",
  profile: { bio: "Developer", avatar: "avatar.jpg" },
});

const { data } = db.users
  .query()
  .where((u) => u.profile.bio.includes("Developer"));
```

## TypeScript Tips

The library provides full type inference:
```typescript
const { data } = db.users.query().select({ name: true, email: true });
// data is typed as: { name: string; email: string }[]

const { data: user } = db.users.insert({ id: 1, name: "Alice", email: "..." });
// user is typed as: { id: number; name: string; email: string }
```


## License

MIT

## Contributing

Contributions are welcome! Please open an issue or PR on GitHub.

---

Built with ❤️ using TypeScript and Zod