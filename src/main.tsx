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
// import AddToCart from "./pages/AddToCart";
import { ManageOrders } from "./features/orders/ManageOrders";
import { MyOrders } from "./features/orders/MyOrders";
import { CodCheckout } from "./features/orders/CodCheckout";

// const nav = useNavigate();

ReactDOM.createRoot(document.getElementById("root")!).render(
  
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Products />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute roles={["Manager", "Admin"]} />}>
              <Route path="/manager" element={<Manager />} />
              <Route path="/manage/orders" element={<ManageOrders />} />
            </Route>

            <Route element={<ProtectedRoute roles={["Customer"]} />}>
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/checkout" element={
                <CodCheckout 
                // onSuccess={(order) => {nav(`/orders/${order.id}`)}} 
                />} />
            </Route>

            <Route element={<ProtectedRoute roles={["Admin"]} />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
            
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
