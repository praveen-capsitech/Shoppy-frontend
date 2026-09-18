export type Role = "Customer" | "Manager" | "Admin";
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
export interface AuthResponse {
  token: string;
  user: User;
}
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
  createdAt: string;
}
export interface ProductDetails extends Product {
  ownerName: string;
}
export interface AdminUser extends User {
  isActive: boolean;
  createdAt: string;
}
