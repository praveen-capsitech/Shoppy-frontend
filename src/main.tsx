import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Manager from "./pages/Manager";
import Products from "./pages/Products";
import Register from "./pages/Register";
import "./styles.css";
import { ManageOrders } from "./features/orders/ManageOrders";
import { MyOrders } from "./features/orders/MyOrders";
import { CodCheckout } from "./features/orders/CodCheckout";
import ProductDetails from "./components/ProductDetails";
import Dashboard from "./pages/Dashboard";

function CheckoutPage() {
  const nav = useNavigate();

  return <CodCheckout onSuccess={() => nav("/my-orders")} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route element={<ProtectedRoute roles={["Admin", "Customer"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/manager" element={<Register />} />

            <Route element={<ProtectedRoute roles={["Manager", "Admin"]} />}>
              <Route path="/manage/products" element={<Manager />} />
              <Route path="/manage/orders" element={<ManageOrders />} />
            </Route>

            <Route element={<ProtectedRoute roles={["Customer", "Manager", "Admin"]} />}>
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/checkout" element={<CheckoutPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["Admin"]} />}>
              <Route path="/manage/users" element={<Admin />} />
            </Route>
            
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
