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
  getCart: () => apiClient.get<Cart>("/api/cart"),

  addToCart: (productId: string, quantity = 1) =>
    apiClient.post<Cart>("/api/cart/items", { productId, quantity }),

  updateCartItem: (productId: string, quantity: number) =>
    apiClient.put<Cart>(`/api/cart/items/${productId}`, { quantity }),

  removeCartItem: (productId: string) =>
    apiClient.delete<Cart>(`/api/cart/items/${productId}`),

  clearCart: () => apiClient.delete<void>("/api/cart"),

  createCodOrder: (shippingAddress: ShippingAddress) =>
    apiClient.post<Order>("/api/orders/cod", { shippingAddress }),

  getMyOrders: () => apiClient.get<Order[]>("/api/orders/mine"),

  cancelMyOrder: (id: string) =>
    apiClient.post<Order>(`/api/orders/mine/${id}/cancel`, {}),

  getManageOrders: () => apiClient.get<Order[]>("/api/orders/manage"),

  updateOrderStatus: (id: string, status: OrderStatus) =>
    apiClient.patch<Order>(`/api/orders/manage/${id}/status`, { status }),
};
