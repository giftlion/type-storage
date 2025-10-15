import { z } from "zod";

class Table<Row> {
  private table: Row[] = [];

  public query(predicate?: (item: Row) => boolean): Row[] {
    if (predicate) {
      return this.table.filter(predicate);
    }
    return this.table;
  }

  public insert(item: Row) {
    this.table = [...this.table, item];
    return item;
  }

  public delete(predicate: (item: Row) => boolean) {
    const deletedRow = this.table.find(predicate);
    this.table = this.table.filter((item) => !predicate(item));
    return deletedRow;
  }

  public update(predicate: (item: Row) => boolean, newItem: Partial<Row>) {
    const index = this.table.findIndex(predicate);
    if (index !== -1) {
      this.table[index] = { ...this.table[index], ...newItem };
      return this.table[index];
    }
  }

  constructor() {
    this.table = [];
  }
}
export class DB<T extends z.ZodObject> {
  public tables: { [K in keyof z.infer<T>]: Table<z.infer<T>[K]> } = {} as {
    [K in keyof z.infer<T>]: Table<z.infer<T>[K]>;
  };

  constructor(
    public name: string,
    private schema: T
  ) {
    this.name = name;
    this.schema = schema;

    if (schema) {
      const shape = schema.shape;
      for (const tableName of Object.keys(shape) as Array<keyof z.infer<T>>) {
        this.tables[tableName] = new Table<any>() as Table<
          z.infer<T>[typeof tableName]
        >;
       
      }
    }
  }
}

export const where =
  <A extends Record<string, any>>(a: A) =>
  (b: A) => {
    return Object.keys(a).every((key) => a[key] === b[key]);
  };

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

const db1 = new DB("test", schema);

db1.tables.users.query();

db1.tables.users.insert({
  id: 1,
  name: "Alice",
  email: "alice@example.com",
});

db1.tables.users.delete(where({ id: 1 }));
db1.tables.users.update(where({ id: 2 }), { name: "Bob" });
