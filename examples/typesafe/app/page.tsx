import { DB, where } from "@repo/typesafe";
import { z } from "zod";

const schema1 = z.object({
  users: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
  }),
  products: z.object({
    id: z.number(),
    name: z.string(),
    price: z.number().min(0),
  }),
});

const db = new DB("test1", schema1);

export default function Home() {
  db.tables.users.insert({
    id: 1,
    name: "A",
    email: "alice@example.com",
  });

  db.tables.users.insert({
    id: 2,
    name: "B",
    email: "alice@example.com",
  });

  const data1 = db.tables.users.query();
  console.log(data1);

  // db.tables.users.delete((user) => user.id === 1);

  const data2 = db.tables.users.query();
  console.log(data2);

  db.tables.users.delete(where({ id: 2 }));

  const data3 = db.tables.users.query();
  console.log(data3);

  return (
    <div className="flex justify-center items-center flex-col min-h-screen py-2">
      <h1 className="text-4xl font-bold">Typesafe DB Example</h1>
      <CompA />
      <CompB />
    </div>
  );
}

const CompA = () => {
  const name = db.tables.users.query()[0]?.name;
  return <div>{name}</div>;
};

const CompB = () => {
  const email = db.tables.users.query()[0]?.email;
  return <div>{email}</div>;
};
