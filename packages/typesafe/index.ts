import { z } from "zod";

class Table<Row> {
  private table: Row[] = [];

  public query(predicate?: (item: Row) => boolean): Row[] {
    const data = localStorage.getItem(
      `${this.DBname}-${String(this.tableName)}`
    );
    if (data) {
      this.table = JSON.parse(data);
    }
    if (predicate) {
      return this.table.filter(predicate);
    }
    return this.table;
  }

  public insert(item: Row) {
    const data = localStorage.getItem(
      `${this.DBname}-${String(this.tableName)}`
    );
    if (data) {
      this.table = JSON.parse(data);
    }
    localStorage.setItem(
      `${this.DBname}-${String(this.tableName)}`,
      JSON.stringify([...this.table, item])
    );
    this.table = [...this.table, item];
    return item;
  }

  public delete(predicate: (item: Row) => boolean) {
    const data = localStorage.getItem(
      `${this.DBname}-${String(this.tableName)}`
    );
    if (data) {
      this.table = JSON.parse(data);
    }
    const deletedRow = this.table.find(predicate);
    const dataWithoutDeleted = this.table.filter((item) => !predicate(item));
    localStorage.setItem(
      `${this.DBname}-${String(this.tableName)}`,
      JSON.stringify(dataWithoutDeleted)
    );
    this.table = dataWithoutDeleted;
    return deletedRow;
  }

  public update(predicate: (item: Row) => boolean, newItem: Partial<Row>) {
    const data = localStorage.getItem(
      `${this.DBname}-${String(this.tableName)}`
    );
    if (data) {
      this.table = JSON.parse(data);
    }
    const index = this.table.findIndex(predicate);
    if (index !== -1) {
      localStorage.setItem(
        `${this.DBname}-${String(this.tableName)}`,
        JSON.stringify([
          ...this.table.slice(0, index),
          { ...this.table[index], ...newItem },
          ...this.table.slice(index + 1),
        ])
      );
      this.table[index] = { ...this.table[index], ...newItem };
      return this.table[index];
    }
  }

  constructor(
    private tableName: string | number | symbol,
    private DBname: string
  ) {
    this.table = [];
    this.DBname = DBname;
    this.tableName = tableName;
    // localStorage.setItem(`${DBname}-${String(tableName)}`, JSON.stringify([]));
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
        this.tables[tableName] = new Table<any>(tableName, this.name) as Table<
          z.infer<T>[typeof tableName]
        >;
      }
    }
  }
}

export const createClient = <T extends z.ZodObject>(
  name: string,
  { schema }: { schema: T }
) => {
  return new DB(name, schema);
};

export const where = <A extends Record<string, any>>(
  predicate: (item: A) => boolean
) => {
  return predicate;
};

export const equal =
  <A extends Record<string, any>>(a: A) =>
  (b: A) => {
    return Object.keys(a).every((key) => a[key] === b[key]);
  };

export const contain =
  <A extends Record<string, any>>(a: A) =>
  (b: A) => {
    return Object.keys(a).every((key) => b[key]?.includes(a[key]));
  };

export const notEqual = 
  <A extends Record<string, any>>(a: A) =>
  (b: A) => {
    return Object.keys(a).some((key) => a[key] !== b[key]);
  };

const schema = z.object({
  users: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    products: z
      .array(z.object({ id: z.number(), name: z.string() }))
      .optional(),
  }),
});

const db1 = createClient("test1", { schema });

db1.tables.users.query();

db1.tables.users.insert({
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  products: [{ id: 1, name: "Product A" }],
});

db1.tables.users.delete(where(equal({ id: 1 })));
db1.tables.users.update(where(equal({ id: 2 })), { name: "Bob" });
