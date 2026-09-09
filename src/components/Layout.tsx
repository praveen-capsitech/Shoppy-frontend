import * as React from 'react';
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

import { ContextualMenuItemType, IContextualMenuProps } from '@fluentui/react/lib/ContextualMenu';
import { useConst } from '@fluentui/react-hooks';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Panel } from '@fluentui/react/lib/Panel';
import { useBoolean } from '@fluentui/react-hooks';
// import AddToCart from '../pages/AddToCart';

const buttonStyles = { root: { marginRight: 8 } };


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
  brand: { fontWeight: 700, cursor: "pointer" },
});


export default function Layout() {
  const s = useStyles();
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const menuProps = useConst<IContextualMenuProps>(() => ({
    shouldFocusOnMount: true,
    items: [
      { key: 'user', text: user?.name,  disabled: true, },
      { key: 'account', text: 'Account', onClick: () => console.log('Account') },
      { key: 'logout', text: 'Logout', onClick: () => logout() },
    ],
  }));

    const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);

  // This panel doesn't actually save anything; the buttons are just an example of what
  // someone might want to render in a panel footer.
  const onRenderFooterContent = React.useCallback(
    () => (
      <div>
         <DefaultButton onClick={dismissPanel}  styles={buttonStyles}>Cancel</DefaultButton>
        <PrimaryButton onClick={dismissPanel}>
          Continue
        </PrimaryButton>
      </div>
    ),
    [dismissPanel],
  );

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={s.root}>
        <header className={s.header}>
          <Subtitle1 onClick={() => nav("/")} className={s.brand}>ShoppyApp</Subtitle1>
          <nav className={s.nav}>

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

            {user?.role === "Customer" &&  (
              // <Link 
              //   href="/cart" 
              //   onClick={(e) => {e.preventDefault(); nav("/cart")}}
              //   >
              //     Cart
              // </Link>

                <div>
                  <DefaultButton text="Cart" onClick={openPanel} />
                  <Panel
                    isOpen={isOpen}
                    onDismiss={dismissPanel}
                    headerText="Cart Items"
                    closeButtonAriaLabel="Close"
                    onRenderFooterContent={onRenderFooterContent}
                    // Stretch panel content to fill the available height so the footer is positioned
                    // at the bottom of the page
                    isFooterAtBottom={true}
                  >
                    {/* <AddToCart/> */}
                  </Panel>
                </div>
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
