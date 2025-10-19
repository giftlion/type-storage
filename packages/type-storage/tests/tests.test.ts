import { test, expect } from "vitest";
import { createClient, equal } from "../src/index";
import z from "zod";

test("DB operations with localStorage mock", async () => {
  // Mock localStorage
  const storage: Record<string, string> = {};
  global.localStorage = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    },
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

  db.tables.users.insert({
    id: 1,
    name: "Alice",
    email: "alice@example.com",
  });
  db.tables.users.insert({
    id: 2,
    name: "Bob",
    email: "bob@example.com",
  });

  const { data: allUsers } = db.tables.users.query();

  const { data: userA } = db.tables.users.query().where(equal({ id: 1 }));

  // there is no user id 10
  const { error: noIdError } = db.tables.users
    .delete()
    .where(equal({ id: 10 }));

  db.tables.users.delete().where(equal({ id: 2 }));

  const { data: remainingUsers } = db.tables.users.query();

  const { data: updatedUser } = db.tables.users
    .update()
    .where(equal({ id: 1 }), { name: "Alice Updated" });

  expect(allUsers.length).toBe(2);
  expect(userA[0].name).toBe("Alice");
  expect(noIdError).toBeDefined();
  expect(remainingUsers.length).toBe(1);
  expect(updatedUser.name).toBe("Alice Updated");
});
