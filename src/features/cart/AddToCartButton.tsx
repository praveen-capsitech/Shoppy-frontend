import { Button, MessageBar, makeStyles, tokens } from "@fluentui/react-components";
import { Cart24Regular } from "@fluentui/react-icons";
import { useState } from "react";
import { cartOrderApi, notifyCartUpdated } from "../../api/cartOrderApi";

const useStyles = makeStyles({
  root: { display: "flex", flexDirection: "column", gap: tokens.spacingVerticalS },
});

export function AddToCartButton({ productId }: { productId: string }) {
  const styles = useStyles();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const add = async () => {
    setBusy(true);
    setMessage("");
    try {
      const { data } = await cartOrderApi.addToCart(productId);
      notifyCartUpdated(data);
      setMessage("Added to cart.");
    } catch (error: any) {
      // console.log("Error message: ", error?.response?.statusText);
      setMessage(error?.response?.statusText ?? "Unable to add this product to your cart.");
    } finally {
      setBusy(false);
    }
  };

  //  const remove = async () => {
  //   setBusy(true);
  //   setMessage("");
  //   try {
  //     await cartOrderApi.removeCartItem(productId);
  //     setMessage("Removed from cart.");
  //   } catch {
  //     setMessage("Unable to remove this product from your cart.");
  //   } finally {
  //     setBusy(false);
  //   }
  // };

  return (
    <div className={styles.root}>
      <Button
        appearance="primary"
        icon={<Cart24Regular />}
        disabled={busy}
        onClick={() => void add()}
      >
        {busy ? "Adding..." : "Add to Cart"}
      </Button>
      
      {/* <Button
        appearance="secondary"
        icon={<Cart24Regular />}
        disabled={busy}
        onClick={() => void remove()}
      >
        {busy ? "Removing..." : "Remove from Cart"}
      </Button> */}
      {message && <MessageBar intent={message.startsWith("Added") ? "success" : "error"}>{message}</MessageBar>}
    </div>
  );
}
