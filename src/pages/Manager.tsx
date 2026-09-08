import {
  Button,
  Card,
  Field,
  Input,
  MessageBar,
  Title1,
} from "@fluentui/react-components";
import { FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import type { Product } from "../types";

const empty = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  imageUrl: "",
};

export default function Manager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const load = () =>
    api.get<Product[]>("/products").then((r) => setProducts(r.data));
  useEffect(() => {
    load();
  }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/products", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      setForm(empty);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Could not create product.");
    }
  };

  const del = async (id: string) => {
    await api.delete("/products/" + id);
    load();
  };
  
  return (
    <>
      <Title1>Manager dashboard</Title1>
      {error && <MessageBar intent="error">{error}</MessageBar>}
      <Card style={{ padding: 20, margin: "20px 0" }}>
        <h2>Add product</h2>
        <form onSubmit={create} style={{ display: "grid", gap: 12 }}>
          {(
            [
              "name",
              "description",
              "price",
              "stock",
              "category",
              "imageUrl",
            ] as const
          ).map((k) => (
            <Field key={k} label={k}>
              <Input
                value={form[k]}
                onChange={(_, d) => setForm({ ...form, [k]: d.value })}
              />
            </Field>
          ))}
          <Button appearance="primary" type="submit">
            Create product
          </Button>
        </form>
      </Card>
      {products.map((p) => (
        <Card
          key={p.id}
          style={{
            padding: 16,
            marginBottom: 10,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>
            <b>{p.name}</b> — ₹{p.price} — stock {p.stock}
          </span>
          <Button onClick={() => del(p.id)}>Delete</Button>
        </Card>
      ))}
    </>
  );
}
