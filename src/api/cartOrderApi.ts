import { api } from "./client";

export type CartItem = {
  productId: string;
  productName: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Cart = {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
};

export const notifyCartUpdated = (cart: Cart) => {
  window.dispatchEvent(new CustomEvent<Cart>("cart-updated", { detail: cart }));
};

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";

export type ShippingAddress = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
};

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: "CashOnDelivery";
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt?: string;
};

export const cartOrderApi = {
  getCart: () => api.get<Cart>("/cart"),

  addToCart: (productId: string, quantity = 1) =>
    api.post<Cart>("/cart/items", { productId, quantity }),

  updateCartItem: (productId: string, quantity: number) =>
    api.put<Cart>(`/cart/items/${productId}`, { quantity }),

  removeCartItem: (productId: string) =>
    api.delete<Cart>(`/cart/items/${productId}`),

  clearCart: () => api.delete<void>("/cart"),

  createCodOrder: (shippingAddress: ShippingAddress) =>
    api.post<Order>("/orders/cod", { shippingAddress }),

  getMyOrders: () => api.get<Order[]>("/orders/mine"),

  cancelMyOrder: (id: string) =>
    api.post<Order>(`/orders/mine/${id}/cancel`, {}),

  getManageOrders: () => api.get<Order[]>("/orders/manage"),

  updateOrderStatus: (id: string, status: OrderStatus) =>
    api.patch<Order>(`/orders/manage/${id}/status`, { status }),
};
