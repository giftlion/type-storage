// import { z } from "zod";
// import { Prettify } from "./types";

// class Table<Row> {
//   private table: Row[] = [];
//   private DBname: string;
//   private tableName: string | number | symbol;

//   constructor(tableName: string | number | symbol, DBname: string) {
//     this.tableName = tableName;
//     this.DBname = DBname;
//     this.loadTableFromLocalStorage();
//   }

//   private loadTableFromLocalStorage(): void {
//     if (typeof window === "undefined") return;
//     const data = localStorage.getItem(
//       `${this.DBname}-${String(this.tableName)}`
//     );
//     if (data) {
//       this.table = JSON.parse(data);
//     } else {
//       this.table = [];
//     }
//   }

//   private saveTableToLocalStorage(): void {
//     localStorage.setItem(
//       `${this.DBname}-${String(this.tableName)}`,
//       JSON.stringify(this.table)
//     );
//   }

//   public query() {
//     this.loadTableFromLocalStorage();

//     type FilterByTrue<T extends Partial<Record<keyof Row, boolean>>> =
//       Prettify<{
//         [K in keyof T as T[K] extends true ? K : never]: Row[K & keyof Row];
//       }>;

//     return {
//       where: (predicate: (item: Row) => boolean) => {
//         return { data: this.table.filter(predicate), error: null };
//       },
//       select: <Keys extends Partial<Record<keyof Row, boolean>>>(
//         keys: Keys
//       ) => {
//         const selectedData = this.table.map((item) => {
//           const selectedItem: any = {};
//           for (const key of Object.keys(keys)) {
//             if (keys[key as keyof Keys]) {
//               selectedItem[key] = item[key as keyof Row];
//             }
//           }
//           return selectedItem as FilterByTrue<Keys>;
//         });
//         return { data: selectedData, error: null };
//       },
//       data: this.table,
//       error: null,
//     };
//   }

//   public insert(item: Row) {
//     this.loadTableFromLocalStorage();
//     this.table = [...this.table, item];
//     this.saveTableToLocalStorage();
//     return { data: item, error: null };
//   }

//   public delete() {
//     this.loadTableFromLocalStorage();
//     const currentTable = this.table;
//     return {
//       where: (predicate: (item: Row) => boolean) => {
//         const deletedRow = currentTable.find(predicate);
//         if (!deletedRow)
//           return {
//             error: {
//               message: "No matching row found to delete.",
//             },
//             data: null,
//           };
//         this.table = currentTable.filter((item) => !predicate(item));
//         this.saveTableToLocalStorage();
//         return { data: deletedRow, error: null };
//       },
//     };
//   }

//   public update() {
//     this.loadTableFromLocalStorage();
//     const currentTable = this.table;
//     return {
//       where: (predicate: (item: Row) => boolean, newItem: Partial<Row>) => {
//         const index = currentTable.findIndex(predicate);

//         // If no matching row is found, return an error
//         if (index === -1) {
//           return {
//             data: null,
//             error: { message: "No matching row found to update." },
//           };
//         }

//         currentTable[index] = { ...currentTable[index], ...newItem };
//         this.saveTableToLocalStorage();
//         return { data: currentTable[index], error: null };
//       },
//     };
//   }
// }
// export class DB<T extends z.ZodObject> {
//   public tables: { [K in keyof z.infer<T>]: Table<z.infer<T>[K]> } = {} as {
//     [K in keyof z.infer<T>]: Table<z.infer<T>[K]>;
//   };

//   constructor(
//     public name: string,
//     private schema: T
//   ) {
//     this.name = name;
//     this.schema = schema;

//     if (schema) {
//       const shape = schema.shape;
//       for (const tableName of Object.keys(shape) as Array<keyof z.infer<T>>) {
//         this.tables[tableName] = new Table<any>(
//           tableName as string,
//           this.name
//         ) as Table<z.infer<T>[typeof tableName]>;
//       }
//     }
//   }
// }

// export const createClient = <T extends z.ZodObject>(
//   name: string,
//   { schema }: { schema: T }
// ) => {
//   return new DB(name, schema);
// };

// export const where = <A>(predicate: (item: A) => boolean) => {
//   return predicate;
// };

// export const equal =
//   <A extends Record<string, any>>(a: A) =>
//   (b: A) => {
//     return Object.keys(a).every((key) => a[key] === b[key]);
//   };

// export const contains =
//   <A extends Record<string, any>>(a: A) =>
//   (b: A) => {
//     return Object.keys(a).every((key) => b[key]?.includes(a[key]));
//   };

// export const notEqual =
//   <A extends Record<string, any>>(a: A) =>
//   (b: A) => {
//     return Object.keys(a).some((key) => a[key] !== b[key]);
//   };

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

// const { data: whereUsers } = db1.tables.users
//   .query()
//   .where(contains({ name: "Alice" }));
// const { data: selectedUserEmails } = db1.tables.users
//   .query()
//   .select({ email: true, products: true });

// const { data: insertedUser, error: insertError } = db1.tables.users.insert({
//   id: 1,
//   name: "Alice",
//   email: "alice@example.com",
//   products: [{ id: 1, name: "Product A" }],
// });

// const { data, error } = db1.tables.users.delete().where(equal({ id: 1 }));

// const { data: deletedUser, error: deleteError } = db1.tables.users
//   .delete()
//   .where((user) => user.id === 1);

// const { data: updatedUser, error: updateError } = db1.tables.users
//   .update()
//   .where(equal({ id: 2 }), { name: "Bob Updated" });


import { z } from "zod";
import { Prettify } from "./types";

type FilterByTrue<
  T,
  Keys extends Partial<Record<keyof T, boolean>>,
> = Prettify<{
  [K in keyof Keys as Keys[K] extends true ? K : never]: K extends keyof T
    ? T[K]
    : never;
}>;

abstract class BaseQuery<T> {
  constructor(
    protected _data: T,
    protected _error: any = null
  ) {}

  get data(): T {
    return this._data;
  }

  get error() {
    return this._error;
  }

  protected selectFields<Row, Keys extends Partial<Record<keyof Row, boolean>>>(
    item: Row,
    keys: Keys
  ): FilterByTrue<Row, Keys> {
    const selectedItem: any = {};
    for (const key of Object.keys(keys)) {
      if (keys[key as keyof Keys]) {
        selectedItem[key] = item[key as keyof Row];
      }
    }
    return selectedItem as FilterByTrue<Row, Keys>;
  }
}

class SingleQuery<Row> extends BaseQuery<Row> {
  select<Keys extends Partial<Record<keyof Row, boolean>>>(keys: Keys) {
    return new SingleQueryFinal<FilterByTrue<Row, Keys>>(
      this.selectFields(this._data, keys),
      this._error
    );
  }
}

class SingleQueryFinal<Row> extends BaseQuery<Row> {}

class MultiQuery<Row> extends BaseQuery<Row[]> {
  where(predicate: (item: Row) => boolean) {
    return new MultiQueryAfterWhere<Row>(
      this._data.filter(predicate),
      this._error
    );
  }

  select<Keys extends Partial<Record<keyof Row, boolean>>>(keys: Keys) {
    const selectedData = this._data.map((item) =>
      this.selectFields(item, keys)
    );
    return new MultiQueryAfterSelect<FilterByTrue<Row, Keys>>(
      selectedData,
      this._error
    );
  }
}

class MultiQueryAfterWhere<Row> extends BaseQuery<Row[]> {
  select<Keys extends Partial<Record<keyof Row, boolean>>>(keys: Keys) {
    const selectedData = this._data.map((item) =>
      this.selectFields(item, keys)
    );
    return new MultiQueryFinal<FilterByTrue<Row, Keys>>(
      selectedData,
      this._error
    );
  }
}

class MultiQueryAfterSelect<Row> extends BaseQuery<Row[]> {
  where(predicate: (item: Row) => boolean) {
    return new MultiQueryFinal<Row>(this._data.filter(predicate), this._error);
  }
}

class MultiQueryFinal<Row> extends BaseQuery<Row[]> {}

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
    this.table = data ? JSON.parse(data) : [];
  }

  private saveTableToLocalStorage(): void {
    localStorage.setItem(
      `${this.DBname}-${String(this.tableName)}`,
      JSON.stringify(this.table)
    );
  }

  public query() {
    this.loadTableFromLocalStorage();
    return new MultiQuery<Row>(this.table);
  }

  public insert(item: Row) {
    this.loadTableFromLocalStorage();
    this.table = [...this.table, item];
    this.saveTableToLocalStorage();
    return new SingleQuery<Row>(item);
  }

  public insertMany(items: Row[]) {
    this.loadTableFromLocalStorage();
    this.table = [...this.table, ...items];
    this.saveTableToLocalStorage();
    return new MultiQueryAfterWhere<Row>(items);
  }

  public delete() {
    this.loadTableFromLocalStorage();
    const currentTable = this.table;
    return {
      where: (predicate: (item: Row) => boolean) => {
        const deletedRow = currentTable.find(predicate);
        if (!deletedRow) {
          return new SingleQuery<Row>(null as any, {
            message: "No matching row found to delete.",
          });
        }
        this.table = currentTable.filter((item) => !predicate(item));
        this.saveTableToLocalStorage();
        return new SingleQuery<Row>(deletedRow);
      },
    };
  }

  public deleteMany() {
    this.loadTableFromLocalStorage();
    const currentTable = this.table;
    return {
      where: (predicate: (item: Row) => boolean) => {
        const deletedRows = currentTable.filter(predicate);
        if (deletedRows.length === 0) {
          return new MultiQueryAfterWhere<Row>([], {
            message: "No matching rows found to delete.",
          });
        }
        this.table = currentTable.filter((item) => !predicate(item));
        this.saveTableToLocalStorage();
        return new MultiQueryAfterWhere<Row>(deletedRows);
      },
    };
  }

  public update() {
    this.loadTableFromLocalStorage();
    const currentTable = this.table;
    return {
      where: (predicate: (item: Row) => boolean, newItem: Partial<Row>) => {
        const index = currentTable.findIndex(predicate);
        if (index === -1) {
          return new SingleQuery<Row>(null as any, {
            message: "No matching row found to update.",
          });
        }
        currentTable[index] = { ...currentTable[index], ...newItem };
        this.saveTableToLocalStorage();
        return new SingleQuery<Row>(currentTable[index]);
      },
    };
  }

  public updateMany() {
    this.loadTableFromLocalStorage();
    const currentTable = this.table;
    return {
      where: (predicate: (item: Row) => boolean, updates: Partial<Row>) => {
        const updatedRows: Row[] = [];
        this.table = currentTable.map((item) => {
          if (predicate(item)) {
            const updated = { ...item, ...updates };
            updatedRows.push(updated);
            return updated;
          }
          return item;
        });

        if (updatedRows.length === 0) {
          return new MultiQueryAfterWhere<Row>([], {
            message: "No matching rows found to update.",
          });
        }

        this.saveTableToLocalStorage();
        return new MultiQueryAfterWhere<Row>(updatedRows);
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

export const where = <A>(predicate: (item: A) => boolean) => predicate;

export const equal =
  <A extends Record<string, any>>(a: Partial<A>) =>
  (b: A): boolean =>
    Object.keys(a).every((key) => a[key] === b[key]);

export const contains =
  <A extends Record<string, any>>(a: Partial<A>) =>
  (b: A): boolean =>
    Object.keys(a).every((key) => {
      const value = b[key];
      return typeof value === "string" && value.includes(String(a[key]));
    });

export const notEqual =
  <A extends Record<string, any>>(a: Partial<A>) =>
  (b: A): boolean =>
    Object.keys(a).some((key) => a[key] !== b[key]);

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

// const { data, error } = db1.tables.users
//   .insert({
//     id: 1,
//     email: "fdd",
//     name: "ASd",
//   })
//   .select({ name: true });
// const { data: d } = db1.tables.users
//   .insertMany([
//     {
//       id: 1,
//       email: "fdd",
//       name: "ASd",
//     },
//   ])
//   .select({ name: true });

// const { data: a } = db1.tables.users
//   .delete()
//   .where((u) => u.id === 1)
//   .select({ email: true });

// const { data: b } = db1.tables.users.query().select({ email: true });

// const { data: c } = db1.tables.users
//   .query()
//   .where((u) => u.id > 5)
//   .select({ email: true });
// const { data: aa } = db1.tables.users
//   .query()
//   .select({ email: true })
//   .where((u) => u.email.includes("@"));
