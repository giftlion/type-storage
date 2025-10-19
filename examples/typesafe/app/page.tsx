"use client";
import { contains, createClient, equal } from "@giftlion/type-storage";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  users: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    products: z.array(z.string()).optional(),
  }),
});

const db = createClient("mydb", { schema });

export default function Home() {
  const [users, setUsers] = useState(
    db.tables.users.query().select({ id: true, name: true, email: true }).data
  );

  return (
    <div className="flex justify-center items-center flex-col min-h-screen py-2">
      <h1 className="text-4xl font-bold">Typesafe DB Example</h1>
      <div className="mt-4">
        <input
          type="text"
          placeholder="Search users by name"
          className="border p-2 rounded w-full"
          onChange={(e) => {
            if (e.target.value === "") {
              setUsers(db.tables.users.query().data);
              return;
            }
            setUsers(
              db.tables.users.query().where(contains({ name: e.target.value }))
                .data
            );
          }}
        />
      </div>
      {users.map((user) => (
        <div key={user.id} className="mt-4 p-4 border rounded w-1/3">
          <div>
            <p>
              <strong>ID:</strong> {user.id}
            </p>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </div>
          <div>
            <button
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded cursor-pointer"
              onClick={() => {
                db.tables.users.delete().where(equal({ id: user.id }));
                setUsers(db.tables.users.query().data);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      <div>
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer"
          onClick={() => {
            const newId = users.length + 1;
            db.tables.users.insert({
              id: newId,
              name: `user ${newId}`,
              email: `user${newId}@example.com`,
            });
            setUsers(db.tables.users.query().data);
          }}
        >
          add user
        </button>
      </div>
    </div>
  );
}
