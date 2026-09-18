import {
  Button,
  Card,
  MessageBar,
  Spinner,
  Text,
  Title1,
  makeStyles,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddToCartButton } from "../features/cart/AddToCartButton";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import type { ProductDetails as ProductDetailsType } from "../types";

const useStyles = makeStyles({
  page: { maxWidth: "960px", margin: "0 auto" },
  card: { display: "grid", gridTemplateColumns: "minmax(280px, 1fr) 1fr", gap: "32px", padding: "24px" },
  image: { width: "100%", maxHeight: "480px", objectFit: "cover", borderRadius: "8px" },
  details: { display: "flex", flexDirection: "column", gap: "16px" },
  meta: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" },
  actions: { display: "flex", gap: "12px", flexWrap: "wrap" },
});

export default function ProductDetails() {
  const styles = useStyles();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModelOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("Product ID is missing.");
      setLoading(false);
      return;
    }

    api.get<ProductDetailsType>(`/products/${id}`)
      .then((response) => setProduct(response.data))
      .catch((requestError) => {
        setError(requestError.response?.status === 404
          ? "Product not found."
          : "Unable to load product details.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const remove = async () => {
    if (!product) return;
    if (!window.confirm(`Delete ${product.name}?`)) return;

    try {
      await api.delete(`/products/${product.id}`);
      navigate(user?.role === "Customer" ? "/" : "/manager");
    } catch (requestError: any) {
      setError(requestError.response?.statusText ?? "Unable to delete product.");
    }
  };

  // const updateProduct = (productId: string) => {
  //   // navigate(`/manage/products/${productId}`);
  // }


  if (loading) return <Spinner label="Loading product details..." />;
  if (error || !product) return <MessageBar intent="error">{error || "Product not found."}</MessageBar>;

  return (
    <div className={styles.page}>
      <Button appearance="subtle" style={{color:"#0078d4"}} onClick={() => navigate(-1)}>
        Back
      </Button>
      <Card className={styles.card}>
        <img
          className={styles.image}
          src={product.imageUrl || "https://placehold.co/480x480?text=No+Image"}
          alt={product.name}
        />
        <div className={styles.details}>
          <Title1>{product.name}</Title1>
          <Text>{product.description}</Text>
          <Text size={700} weight="semibold">₹{product.price.toFixed(2)}</Text>
          <div className={styles.meta}>
            <Text>Category: {product.category}</Text>
            <Text>Stock: {product.stock}</Text>
          </div>
          <div className={styles.meta}>
            <Text>Product Owner: {product.ownerName}</Text>
            <Text>Created at: {new Date(product.createdAt).toLocaleString()}</Text>
          </div>
          <div className={styles.actions}>
            {user?.role === "Customer" && product.stock > 0 && (
              <AddToCartButton productId={product.id} />
            )}
            
            {user?.role === "Customer" && product.stock === 0 && (
              <Button disabled>Currently unavailable</Button>
            )}
            
            {/* {(user?.role === "Admin" || user?.role === "Manager") && (
              <Button appearance="primary" onClick={() => navigate("/manage/products")}>
                Manage products
              </Button>
            )} */}
            {(user?.role === "Admin" || user?.role === "Manager") && (
              <>
              {/* <Button style={{ marginRight: 10 }} appearance="outline" onClick={() => updateProduct(product.id)}>
                Edit product
              </Button> */}
              <Button appearance="secondary" onClick={() => void remove()}>
                Delete product
              </Button>
              </>
            )}
          </div>
        </div>
      </Card>

      {isModelOpen && (
        <div>
          {/* Modal content for editing product */}
          
        </div>
      )}
    </div>
  );
}
