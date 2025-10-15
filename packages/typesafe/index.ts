type BaseDB = {
  tables: {
    [key: string]: any;
  };
};

class Table<Row> {
  private table: Row[] = [];

  public query(): Row[] {
    return this.table;
  }

  public insert(item: Row) {
    this.table = [...this.table, item];
    return item;
  }

  constructor() {
    this.table = [];
  }
}

export class DB<T extends BaseDB> {
  //   public data: { [K in keyof T["tables"]]: Array<T["tables"][K]> } = {} as {
  //     [K in keyof T["tables"]]: Array<T["tables"][K]>;
  //   };

  public tables: { [K in keyof T["tables"]]: Table<T["tables"][K]> } = {} as {
    [K in keyof T["tables"]]: Table<T["tables"][K]>;
  };

  constructor(public name: string) {
    this.name = name;

    for (const tableName in null as any as T["tables"]) {
      this.tables[tableName] = new Table<T["tables"][typeof tableName]>();
    }
  }
}
