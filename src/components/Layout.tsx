import {
  Button,
  Caption1,
  FluentProvider,
  Link,
  makeStyles,
  Subtitle1,
  tokens,
  webLightTheme,
} from "@fluentui/react-components";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
  content: { maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" },
  brand: { fontWeight: 700 },
});


export default function Layout() {
  const s = useStyles();
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={s.root}>
        <header className={s.header}>
          <Subtitle1 className={s.brand}>ShoppyApp</Subtitle1>
          <nav className={s.nav}>
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                nav("/");
              }}
            >
              Products
            </Link>
            {user?.role !== "Customer" && (
              <Link
                href="/manager"
                onClick={(e) => {
                  e.preventDefault();
                  nav("/manager");
                }}
              >
                Manager
              </Link>
            )}
            {user?.role === "Admin" && (
              <Link
                href="/admin"
                onClick={(e) => {
                  e.preventDefault();
                  nav("/admin");
                }}
              >
                Admin
              </Link>
            )}
            {user ? (
              <>
                <Caption1>
                  {user.name} ({user.role})
                </Caption1>
                <Button onClick={logout}>Logout</Button>
              </>
            ) : (
              <Button onClick={() => nav("/login")}>Login</Button>
            )}
          </nav>
        </header>
        <main className={s.content}>
          <Outlet />
        </main>
      </div>
    </FluentProvider>
  );
}
