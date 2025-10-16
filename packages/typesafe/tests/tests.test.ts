import { test, expect } from "vitest";
import { createClient, equal } from "../index.js";
import z from "zod";

test("DB operations with localStorage mock", async () => {
  // Mock localStorage
  const storage: Record<string, string> = {};
  global.localStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
    key: (index: number) => Object.keys(storage)[index] || null,
    length: Object.keys(storage).length,
  } as Storage;

  const schema = z.object({
    users: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
    }),
  });
  
  const db = createClient("mydb", { schema });
  
  db.tables.users.insert({ id: 1, name: "Alice", email: "alice@example.com" });
  db.tables.users.insert({ id: 2, name: "Bob", email: "bob@example.com" });

  const allUsers = db.tables.users.query().all();
  const user1 = db.tables.users.query().where(equal({ id: 1 }));
  
  expect(allUsers.length).toBe(2);
  expect(user1[0]?.name).toBe("Alice");
});