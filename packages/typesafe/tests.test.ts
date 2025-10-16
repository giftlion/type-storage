import { DB, equal, where } from "./index";
import { z } from "zod";
import { expect, test } from "vitest";

const schema = z.object({
  users: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
  }),
  products: z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
  }),
});

test("DB operations", () => {
  const db = new DB("test", schema);

  const insert1 = db.tables.users.insert({
    id: 1,
    name: "Alice",
    email: "alice@example.com",
  });

  const insert2 = db.tables.users.insert({
    id: 2,
    name: "Bob",
    email: "bob@example.com",
  });

  const insert3 = db.tables.users.insert({
    id: 3,
    name: "Product A",
    email: "productA@example.com",
  });

  expect(db.tables.users.query().length).toBe(3);

  expect(db.tables.users.query().where(equal({ id: 1 })).length).toBe(1);

  const UpdatedUser = db.tables.users.update(where(equal({ id: 1 })), {
    name: "Alice Updated",
  });

  expect(UpdatedUser?.name).toBe("Alice Updated");

  db.tables.users.delete(where(equal({ id: 2 })));

  expect(db.tables.users.query().length).toBe(2);

  db.tables.users.delete(where(equal({ id: 1, name: "Alice Updated" })));

  expect(db.tables.users.query().length).toBe(1);

  //   shouldnt delete because name is different
  db.tables.users.delete(where(equal({ id: 3, name: "bla bla" })));

  expect(db.tables.users.query().length).toBe(1);
});
