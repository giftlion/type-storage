import { z } from "zod";
import { FilterByTrue } from "./types";

abstract class BaseQuery<T> {
  constructor(
    protected _data: T,
    protected _error: any = null,
    protected strorageKey: string
  ) {}

  get data(): T {
    return this._data;
  }

  get error() {
    return this._error;
  }

  get storageKey(): string {
    return this.strorageKey;
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
      this._error,
      this.storageKey
    );
  }
}

class SingleQueryFinal<Row> extends BaseQuery<Row> {}

class MultiQuery<Row> extends BaseQuery<Row[]> {
  where(predicate: (item: Row) => boolean) {
    return new MultiQueryAfterWhere<Row>(
      this._data.filter(predicate),
      this._error,
      this.storageKey
    );
  }

  select<Keys extends Partial<Record<keyof Row, boolean>>>(keys: Keys) {
    const selectedData = this._data.map((item) =>
      this.selectFields(item, keys)
    );
    return new MultiQueryAfterSelect<FilterByTrue<Row, Keys>>(
      selectedData,
      this._error, 
      this.storageKey
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
      this._error,
      this.storageKey
    );
  }
}

class MultiQueryAfterSelect<Row> extends BaseQuery<Row[]> {
  where(predicate: (item: Row) => boolean) {
    return new MultiQueryFinal<Row>(this._data.filter(predicate), this._error, this.storageKey);
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

  private getStorageKey(): string {
    return `${this.DBname}-${String(this.tableName)}`;
  }

  private loadTableFromLocalStorage(): void {
    if (typeof window === "undefined") return;
    const data = localStorage.getItem(this.getStorageKey());
    this.table = data ? JSON.parse(data) : [];
  }

  private saveTableToLocalStorage(): void {
    const key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(this.table));

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("local-storage-change", {
          detail: { key },
        })
      );
    }
  }

  public query() {
    this.loadTableFromLocalStorage();
    return new MultiQuery<Row>(this.table, null, this.getStorageKey());
  }

  public insert(item: Row) {
    this.loadTableFromLocalStorage();
    this.table = [...this.table, item];
    this.saveTableToLocalStorage();
    return new SingleQuery<Row>(item, null, this.getStorageKey());
  }

  public insertMany(items: Row[]) {
    this.loadTableFromLocalStorage();
    this.table = [...this.table, ...items];
    this.saveTableToLocalStorage();
    return new MultiQueryAfterWhere<Row>(items, null, this.getStorageKey());
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
          }, this.getStorageKey());
        }
        this.table = currentTable.filter((item) => !predicate(item));
        this.saveTableToLocalStorage();
        return new SingleQuery<Row>(deletedRow, null, this.getStorageKey());
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
          }, this.getStorageKey());
        }
        this.table = currentTable.filter((item) => !predicate(item));
        this.saveTableToLocalStorage();
        return new MultiQueryAfterWhere<Row>(deletedRows, null, this.getStorageKey());
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
          }, this.getStorageKey());
        }
        currentTable[index] = { ...currentTable[index], ...newItem };
        this.saveTableToLocalStorage();
        return new SingleQuery<Row>(currentTable[index], null, this.getStorageKey());
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
          }, this.getStorageKey());
        }

        this.saveTableToLocalStorage();
        return new MultiQueryAfterWhere<Row>(updatedRows, null, this.getStorageKey());
      },
    };
  }
}

export class DB<T extends z.ZodObject> {
  public tables: { [K in keyof z.infer<T>]: Table<z.infer<T>[K]> } = {} as {
    [K in keyof z.infer<T>]: Table<z.infer<T>[K]>;
  };

  constructor(
    private name: string,
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
  return new DB(name, schema).tables;
};

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


