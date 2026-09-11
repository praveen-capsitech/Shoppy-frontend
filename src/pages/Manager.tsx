import * as React from 'react';
import { useId, useBoolean } from '@fluentui/react-hooks';
import {
  getTheme,
  mergeStyleSets,
  FontWeights,
  ContextualMenu,
  Toggle,
  Modal,
  IDragOptions,
  IIconProps,
  Stack,
  IStackProps,
} from '@fluentui/react';
import { DefaultButton, IconButton, IButtonStyles } from '@fluentui/react/lib/Button';

import {
  Button,
  Card,
  Field,
  Input,
  MessageBar,
  Title1,
  Textarea,
  Body1,
} from "@fluentui/react-components";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
  const [isDraggable, { toggle: toggleIsDraggable }] = useBoolean(false);
  const [keepInBounds, { toggle: toggleKeepInBounds }] = useBoolean(false);
  const titleId = useId('title');
 
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const load = () =>
    api.get<Product[]>("/products/managed").then((r) => setProducts(r.data));

  useEffect(() => {
    load();
  }, []);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/products", {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });

      setForm(empty);
      hideModal();
      
      load();
    } catch (err: any) {
      setError(
        err.response?.data?.message ?? "Could not create product."
      );
    }
  };

  const del = async (id: string) => {
    try {
      await api.delete("/products/" + id);
      load();
    } catch (err: any) {
      setError(
        err.response?.data?.message ?? "Could not delete product."
      );
    }
  };

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" , flexWrap: "wrap", gap: 12}}>
          <div>
             <Title1>Product Management</Title1>
            <Body1 style={{ display: "block", marginTop: 6, color: "#666" }}>
              Manage your products and inventory 
              <span
                style={{
                  fontSize: 10,
                  marginLeft: 8,
                  color: "#080707",
                  background: "#9cc0f0",
                  padding: "6px 12px",
                  borderRadius: 20,
                }}
              >
                {products.length} product
                {products.length !== 1 ? "s" : ""}
              </span>
            </Body1>
          </div>

          <div>
              <DefaultButton onClick={showModal} text="Add Product" />
          </div>
      </div>

      {/* Error */}
      {error && (
        <MessageBar
          intent="error"
          style={{ marginBottom: 20 }}
        >
          {error}
        </MessageBar>
      )}

      {/* Products */}
        <div>
          {/* Product List */}
          <div
            style={{
              display: "grid",
               gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 14,
            }}
          >
            {products.map((p) => (
              <Card
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                style={{
                  padding: 16,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  transition: "box-shadow 0.2s ease",
                }}
              >
                {/* Product Image */}
                <div
                  style={{
                    width: 90,
                    height: 90,
                    minWidth: 90,
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "#f5f5f5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={
                      p.imageUrl ||
                      "https://placehold.co/180x180?text=No+Image"
                    }
                    alt={p.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/180x180?text=No+Image";
                    }}
                  />
                </div>

                {/* Product Information */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {/* Name + Category */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 6,
                      flexWrap: "wrap",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#242424",
                         whiteSpace: "wrap",
                      }}
                    >
                      {p.name}
                    </h3>

                    {p.category && (
                      <span
                        style={{
                          fontSize: 12,
                          padding: "3px 9px",
                          borderRadius: 12,
                          background: "#f0f0f0",
                          color: "#555",
                        }}
                      >
                        {p.category}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: 13,
                      color: "#666",
                      maxWidth: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "wrap",
                    }}
                  >
                    {p.description || "No description available"}
                  </p>

                  {/* Price + Stock */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 24,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 17,
                        fontWeight: 700,
                        color: "#1a1a1a",
                      }}
                    >
                      ₹{p.price.toLocaleString("en-IN")}
                    </span>

                    <span
                      style={{
                        fontSize: 13,
                        color: p.stock > 0 ? "#107c10" : "#d13438",
                        fontWeight: 500,
                      }}
                    >
                      {p.stock > 0
                        ? `${p.stock} in stock`
                        : "Out of stock"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Button
                    appearance="secondary"
                    onClick={(event) => {
                      event.stopPropagation();
                      void del(p.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}

            {/* Empty State */}
            {products.length === 0 && (
              <Card
                style={{
                  padding: 40,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  No products found
                </div>

                <div
                  style={{
                    fontSize: 14,
                    color: "#666",
                  }}
                >
                  Add your first product using the form above.
                </div>
              </Card>
            )}
          </div>
        </div>

      {/* Add Product Modal */}
      <Modal
        titleAriaId={titleId}
        isOpen={isModalOpen}
        onDismiss={hideModal}
        isBlocking={false}
        containerClassName={contentStyles.container}
        // dragOptions={isDraggable ? dragOptions : undefined}
      >
        <div className={contentStyles.header}>
          <h2 className={contentStyles.heading} id={titleId}>
            Add Product
          </h2>
          <IconButton
            styles={iconButtonStyles}
            iconProps={cancelIcon}
            ariaLabel="Close popup modal"
            onClick={hideModal}
          />
        </div>
        <div className={contentStyles.body}>
          <form onSubmit={create}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: "18px 20px",
              }}
            >
              {/* Product Name */}
              <Field label="Product Name" required>
                <Input
                 style={{ border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px" }}
                  placeholder="Enter product name"
                  value={form.name}
                  onChange={(_, data) =>
                    updateField("name", data.value)
                  }
                />
              </Field>

              {/* Category */}
              <Field label="Category" required>
                <Input
                  style={{ border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px" }}
                  placeholder="e.g. Electronics"
                  value={form.category}
                  onChange={(_, data) =>
                    updateField("category", data.value)
                  }
                />
              </Field>

              {/* Price */}
              <Field label="Price (₹)" required>
                <Input
                  style={{ border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px" }}
                  type="number"
                  min="0"
                  placeholder="Enter price"
                  value={form.price}
                  onChange={(_, data) =>
                    updateField("price", data.value)
                  }
                />
              </Field>

              {/* Stock */}
              <Field label="Stock Quantity" required>
                <Input
                  style={{ border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px" }}
                  type="number"
                  min="0"
                  placeholder="Enter stock quantity"
                  value={form.stock}
                  onChange={(_, data) =>
                    updateField("stock", data.value)
                  }
                />
              </Field>

              {/* Description */}
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Description">
                  <Textarea
                    placeholder="Enter product description"
                    value={form.description}
                    onChange={(_, data) =>
                      updateField("description", data.value)
                    }
                    resize="vertical"
                    style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px" }}
                  />
                </Field>
              </div>

              {/* Image URL */}
              <div style={{ gridColumn: "1 / -1" }}>
                <Field label="Image URL">
                  <Input
                    style={{ border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px" }}
                    placeholder="https://product-image.jpg"
                    value={form.imageUrl}
                    onChange={(_, data) =>
                      updateField("imageUrl", data.value)
                    }
                  />
                </Field>
              </div>
            </div>

            {/* Submit */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 24,
                paddingTop: 20,
                borderTop: "1px solid #eee",
              }}
            >
              <Button
                style={{ border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px" }}
                appearance="primary"
                type="submit"
              >
                Create Product
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

const cancelIcon: IIconProps = { iconName: 'Cancel' };

const theme = getTheme();
const contentStyles = mergeStyleSets({
  container: {
    display: 'flex',
    width: '720px',
    flexFlow: 'column nowrap',
    alignItems: 'stretch',
  },

  header: [
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    theme.fonts.xLargePlus,
    {
      flex: '1 1 auto',
      borderTop: `4px solid ${theme.palette.themePrimary}`,
      color: theme.palette.neutralPrimary,
      display: 'flex',
      alignItems: 'center',
      fontWeight: FontWeights.semibold,
      padding: '12px 12px 14px 24px',
    },
  ],

  heading: {
    color: theme.palette.neutralPrimary,
    fontWeight: FontWeights.semibold,
    fontSize: 'inherit',
    margin: '0',
  },

  body: {
    flex: '4 4 auto',
    padding: '0 24px 24px 24px',
    overflowY: 'hidden',
    selectors: {
      p: { margin: '14px 0' },
      'p:first-child': { marginTop: 0 },
      'p:last-child': { marginBottom: 0 },
    },
  },
});

const iconButtonStyles: Partial<IButtonStyles> = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: 'auto',
    marginTop: '4px',
    marginRight: '2px',
  },
  rootHovered: {
    color: theme.palette.neutralDark,
  },
};
