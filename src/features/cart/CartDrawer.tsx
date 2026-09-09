import {
  Button,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Field,
  Input,
  MessageBar,
  Spinner,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  Delete24Regular,
  Dismiss24Regular,
  Cart24Regular,
} from "@fluentui/react-icons";
import { useEffect, useState } from "react";
import { cartOrderApi, Cart } from "../../api/cartOrderApi";

const useStyles = makeStyles({
  body: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalL },
  item: {
    display: "grid",
    gridTemplateColumns: "64px 1fr auto",
    gap: tokens.spacingHorizontalM,
    alignItems: "center",
    paddingBottom: tokens.spacingVerticalM,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  image: { width: "64px", height: "64px", objectFit: "cover", borderRadius: tokens.borderRadiusMedium },
  controls: { display: "flex", alignItems: "center", gap: tokens.spacingHorizontalS },
  footer: { marginTop: "auto", display: "flex", flexDirection: "column", gap: tokens.spacingVerticalM },
});

type Props = {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
};

export function CartDrawer({ open, onClose, onCheckout }: Props) {
  const styles = useStyles();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setCart((await cartOrderApi.getCart()).data);
    } catch {
      setError("Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) void load();
  }, [open]);

  const update = async (productId: string, quantity: number) => {
    try {
      setCart((await cartOrderApi.updateCartItem(productId, quantity)).data);
    } catch {
      setError("Unable to update the cart.");
    }
  };

  const remove = async (productId: string) => {
    try {
      setCart((await cartOrderApi.removeCartItem(productId)).data);
    } catch {
      setError("Unable to remove the item.");
    }
  };

  return (
    <Drawer open={open} onOpenChange={(_, data) => !data.open && onClose()} position="end" size="medium">
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} />
          }
        >
          <Cart24Regular /> Shopping Cart
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody className={styles.body}>
        {error && <MessageBar intent="error">{error}</MessageBar>}
        {loading && <Spinner label="Loading cart..." />}

        {!loading && cart?.items.length === 0 && (
          <Text align="center">Your cart is empty.</Text>
        )}

        {cart?.items.map((item) => (
          <div className={styles.item} key={item.productId}>
            {item.imageUrl ? (
              <img className={styles.image} src={item.imageUrl} alt={item.productName} />
            ) : <div className={styles.image} />}

            <div>
              <Text weight="semibold">{item.productName}</Text>
              <Text block>₹{item.unitPrice.toFixed(2)}</Text>
              <div className={styles.controls}>
                <Button size="small" onClick={() => void update(item.productId, item.quantity - 1)}>-</Button>
                <Text>{item.quantity}</Text>
                <Button size="small" onClick={() => void update(item.productId, item.quantity + 1)}>+</Button>
              </div>
            </div>

            <Button
              appearance="subtle"
              icon={<Delete24Regular />}
              aria-label={`Remove ${item.productName}`}
              onClick={() => void remove(item.productId)}
            />
          </div>
        ))}

        {cart && cart.items.length > 0 && (
          <div className={styles.footer}>
            <Text size={500} weight="semibold">
              Total: ₹{cart.subtotal.toFixed(2)}
            </Text>
            <Button appearance="primary" size="large" onClick={onCheckout}>
              Proceed to COD Checkout
            </Button>
          </div>
        )}
      </DrawerBody>
    </Drawer>
  );
}
