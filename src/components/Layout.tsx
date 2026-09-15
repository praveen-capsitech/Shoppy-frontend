import * as React from 'react';
import {
  Button,
  FluentProvider,
  Link,
  makeStyles,
  Subtitle1,
  tokens,
  webLightTheme,
} from "@fluentui/react-components";
import {
  Cart24Regular,
} from "@fluentui/react-icons";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { IContextualMenuProps } from '@fluentui/react/lib/ContextualMenu';
import { useConst } from '@fluentui/react-hooks';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { CartDrawer } from '../features/cart/CartDrawer';
import { cartOrderApi, Cart } from '../api/cartOrderApi';

const useStyles = makeStyles({
  root: { minHeight: "100vh", backgroundColor: tokens.colorNeutralBackground2 },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 28px",
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  nav: { display: "flex", gap: "18px", alignItems: "center" },
  content: {  margin: "0 auto", padding: "44px 30px" },
  brand: { fontWeight: 700, cursor: "pointer" },
  cartButton: { position: "relative", display: "inline-flex", cursor: "pointer" },
  cartBadge: {
    position: "absolute",
    top: "-8px",
    right: "-10px",
    minWidth: "18px",
    height: "18px",
    padding: "0 4px",
    borderRadius: "9px",
    backgroundColor: "#d13438",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 700,
    lineHeight: "18px",
    textAlign: "center",
  },
});


export default function Layout() {
  const s = useStyles();
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [cartCount, setCartCount] = React.useState(0);

  React.useEffect(() => {
    if (user?.role !== "Customer") {
      setCartCount(0);
      return;
    }

    void cartOrderApi.getCart().then(({ data }) => setCartCount(data.totalItems));

    const handleCartUpdated = (event: Event) => {
      const cart = (event as CustomEvent<Cart>).detail;
      setCartCount(cart.totalItems);
    };

    window.addEventListener("cart-updated", handleCartUpdated);
    return () => window.removeEventListener("cart-updated", handleCartUpdated);
  }, [user?.role]);


  const menuProps = useConst<IContextualMenuProps>(() => ({
    shouldFocusOnMount: true,
    items: [
      { key: 'user', text: user?.name,  disabled: true, },
      { key: 'logout', text: 'Logout', onClick: () => logout() },
    ],
  }));

  const [isCartOpen, setIsCartOpen] = React.useState(false);

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={s.root}>
        <header className={s.header}>
          <Subtitle1 onClick={() => nav("/")} className={s.brand}>ShoppyApp</Subtitle1>
          <nav className={s.nav}>

            {
              user?.role === "Admin" && (
                <Link
                  href="/dashboard"
                  onClick={(e) => {
                    e.preventDefault();
                    nav("/dashboard");
                  }}
                >
                  Dashboard
                </Link>
              ) 
            }

            {user?.role === "Admin" && (
              <>
                <Link
                  href="/manage/users"
                  onClick={(e) => {
                    e.preventDefault();
                    nav("/manage/users");
                  }}
                >
                 Manage Users
                </Link>
                
                <Link
                  href="/manage/orders"
                  onClick={(e) => {
                    e.preventDefault();
                    nav("/manage/orders");
                  }}
                >
                 Manage Orders
                </Link>

                
              </>
            )}

             {user?.role !== "Customer" && user && (
              <Link
                href="/manage/products"
                onClick={(e) => {
                  e.preventDefault();
                  nav("/manage/products");
                }}
              >
              Manage Products
              </Link>
            )}

            {user?.role === "Customer" &&  (
                <>
                  <div className={s.cartButton} onClick={() => setIsCartOpen(true)}>
                    <Cart24Regular style={{ color: "#0078d4" }} aria-label="Open shopping cart" />
                    {cartCount > 0 && <span className={s.cartBadge}>{cartCount > 99 ? "99+" : cartCount}</span>}
                  </div>
                  <CartDrawer
                    open={isCartOpen}
                    onClose={() => setIsCartOpen(false)}
                    onCheckout={() => {
                      setIsCartOpen(false);
                      nav("/checkout");
                    }}
                  />

                  <Link
                    href="/my-orders"
                    onClick={(e) => {
                      e.preventDefault();
                      nav("/my-orders");
                    }}
                  >
                  My Orders
                  </Link>
                  
                </>
            )}

            {user ? (
              <>
                <DefaultButton text={`${user?.name} (${user?.role})`} menuProps={menuProps} />
              </>
            ) : (
              <Button onClick={() => nav("/login")}>Login</Button>
            )}

            {/* {
              user && (
                <Caption1>
                  {user?.name} <br/> ({user?.role})
            </Caption1>
              )
            } */}
            
          </nav>
        </header>
        <main className={s.content}>
          <Outlet />
        </main>
      </div>
    </FluentProvider>
  );
}
