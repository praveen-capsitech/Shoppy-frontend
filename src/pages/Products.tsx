import {
  Button,
  Card,
  Input,
  MessageBar,
  Spinner,
  Title1,
  makeStyles,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { Product } from "../types";
import { AddToCartButton } from "../features/cart/AddToCartButton";

const useStyles = makeStyles({
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
    gap: "18px",
  },
  card: { padding: "18px",cursor:"pointer" },
  img: { width: "100%", height: "170px", objectFit: "cover", borderRadius: "8px" },
});

export default function Products() {
  const s = useStyles();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  useEffect(() => {
    api
      .get<Product[]>("/products")
      .then((r) => setProducts(r.data))
      .catch(() => setError("Unable to load products."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    (p.name + " " + p.category).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      <Title1>Shop products</Title1>
      <Input
        placeholder="Search products..."
        value={search}
        onChange={(_, d) => setSearch(d.value)}
        style={{ margin: "20px 0", width: "100%" }}
      />
      {error && <MessageBar intent="error">{error}</MessageBar>}
      {loading ? (
        <Spinner label="Loading products..." />
      ) : (
        <div className={s.grid}>
          {filtered.map((p) => (
            <Card key={p.id} className={s.card} onClick={() => navigate(`/products/${p.id}`)}>
              {p.imageUrl && (
                <img className={s.img} src={p.imageUrl} alt={p.name} />
              )}
              <h2>{p.name}</h2>
              <p>{p.description}</p>
              <b>₹{p.price.toFixed(2)}</b>
              <p>Stock: {p.stock}</p>
              
              {
                p?.stock === 0 ? (
                  <Button appearance="primary" disabled={p.stock === 0}>
                    Currently Unavailable  
                  </Button>
                ) : (
                  <AddToCartButton productId={p.id} />
                )
              }
              {/* <Button appearance="secondary">
                View details
              </Button> */}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
