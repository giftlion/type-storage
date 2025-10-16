import { z } from "zod";

class Table<Row> {
  private table: Row[] = [];
  private DBname: string;
  private tableName: string | number | symbol;

  constructor(tableName: string | number | symbol, DBname: string) {
    this.tableName = tableName;
    this.DBname = DBname;
    this.loadTableFromLocalStorage();
  }

  private loadTableFromLocalStorage(): void {
    if (typeof window === "undefined") return;
    const data = localStorage.getItem(
      `${this.DBname}-${String(this.tableName)}`
    );
    if (data) {
      this.table = JSON.parse(data);
    } else {
      this.table = [];
    }
  }

  private saveTableToLocalStorage(): void {
    localStorage.setItem(
      `${this.DBname}-${String(this.tableName)}`,
      JSON.stringify(this.table)
    );
  }

  public query() {
    this.loadTableFromLocalStorage();

    return {
      where: (predicate: (item: Row) => boolean) => {
        return this.table.filter(predicate);
      },
      all: () => {
        return this.table;
      },
    };
  }

  public insert(item: Row) {
    this.loadTableFromLocalStorage();
    this.table = [...this.table, item];
    this.saveTableToLocalStorage();
    return item;
  }

  public delete() {
    this.loadTableFromLocalStorage();
    const currentTable = this.table;
    return {
      where: (predicate: (item: Row) => boolean) => {
        const deletedRow = currentTable.find(predicate);
        this.table = currentTable.filter((item) => !predicate(item));
        this.saveTableToLocalStorage();
        return deletedRow;
      },
    };
  }

  public update() {
    this.loadTableFromLocalStorage();
    const currentTable = this.table;
    return {
      where: (predicate: (item: Row) => boolean, newItem: Partial<Row>) => {
        const index = currentTable.findIndex(predicate);
        if (index !== -1) {
          currentTable[index] = { ...currentTable[index], ...newItem };
          this.saveTableToLocalStorage();
          return currentTable[index];
        }
      },
    };
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
        this.tables[tableName] = new Table<any>(
          tableName as string,
          this.name
        ) as Table<z.infer<T>[typeof tableName]>;
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

export const where = <A>(predicate: (item: A) => boolean) => {
  return predicate;
};

export const equal =
  <A extends Record<string, any>>(a: A) =>
  (b: A) => {
    return Object.keys(a).every((key) => a[key] === b[key]);
  };

export const contains =
  <A extends Record<string, any>>(a: A) =>
  (b: A) => {
    return Object.keys(a).every((key) => b[key]?.includes(a[key]));
  };

export const notEqual =
  <A extends Record<string, any>>(a: A) =>
  (b: A) => {
    return Object.keys(a).some((key) => a[key] !== b[key]);
  };

// const schema = z.object({
//   users: z.object({
//     id: z.number(),
//     name: z.string(),
//     email: z.string(),
//     products: z
//       .array(z.object({ id: z.number(), name: z.string() }))
//       .optional(),
//   }),
// });

// const db1 = createClient("test1", { schema });

// db1.tables.users.query().where(contains({ name: "Alice" }));

// db1.tables.users.insert({
//   id: 1,
//   name: "Alice",
//   email: "alice@example.com",
//   products: [{ id: 1, name: "Product A" }],
// });

// db1.tables.users.delete().where(equal({ id: 1 }));
// db1.tables.users.delete().where((user) => user.id === 1);
// db1.tables.users.update().where(equal({ id: 2 }), { name: "Bob Updated" });
