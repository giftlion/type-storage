import { DB } from "@repo/typesafe";

const db1 = new DB<MyDB1>("test");
const db2 = new DB<MyDB2>("test2");

const insertDB1 = db1.tables.users.insert({
  id: 1,
  name: "Alice",
  email: "alice@example.com",
});

const DB1data = db1.tables.users.query();

console.log(DB1data); // Output: [ { id: 1, name: 'Alice', email: 'alice@example.com' } ]

const insertDB2 = db2.tables.posts.insert({
  id: 1,
  title: "Hello World",
  content: "This is my first post.",
});

const DB2data = db2.tables.posts.query();

console.log(DB2data);

type MyDB1 = {
  tables: {
    users: {
      id: number;
      name: string;
      email: string;
    };
    products: {
      id: number;
      name: string;
      price: number;
    };
  };
};

type MyDB2 = {
  tables: {
    posts: {
      id: number;
      title: string;
      content: string;
    };
    comments: {
      id: number;
      postId: number;
      content: string;
    };
  };
};