import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  MessageBar,
  Spinner,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useState } from "react";
import { cartOrderApi, Order, ShippingAddress } from "../../api/cartOrderApi";

const useStyles = makeStyles({
  page: { maxWidth: "760px", margin: "0 auto", padding: tokens.spacingVerticalXXL },
  form: { display: "grid", gap: tokens.spacingVerticalM },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: tokens.spacingHorizontalM },
  payment: {
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
  },
});

const empty: ShippingAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
};

export function CodCheckout({ onSuccess }: { onSuccess: (order: Order) => void }) {
  const styles = useStyles();
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof ShippingAddress, value: string) =>
    setForm((x) => ({ ...x, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await cartOrderApi.createCodOrder(form);
      onSuccess(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Unable to place the order.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card>
        <CardHeader
          header={<Text size={600} weight="semibold">Cash on Delivery</Text>}
          description="Enter your delivery address. Payment will be collected when your order arrives."
        />

        <form className={styles.form} onSubmit={submit}>
          {error && <MessageBar intent="error">{error}</MessageBar>}

          <Field label="Full name" required>
            <Input value={form.fullName} onChange={(_, d) => set("fullName", d.value)} />
          </Field>

          <Field label="Phone" required>
            <Input value={form.phone} onChange={(_, d) => set("phone", d.value)} />
          </Field>

          <Field label="Address line 1" required>
            <Input value={form.addressLine1} onChange={(_, d) => set("addressLine1", d.value)} />
          </Field>

          <Field label="Address line 2">
            <Input value={form.addressLine2} onChange={(_, d) => set("addressLine2", d.value)} />
          </Field>

          <div className={styles.row}>
            <Field label="City" required>
              <Input value={form.city} onChange={(_, d) => set("city", d.value)} />
            </Field>
            <Field label="State" required>
              <Input value={form.state} onChange={(_, d) => set("state", d.value)} />
            </Field>
          </div>

          <Field label="Postal code" required>
            <Input value={form.postalCode} onChange={(_, d) => set("postalCode", d.value)} />
          </Field>

          <div className={styles.payment}>
            <Text weight="semibold">Payment method: Cash on Delivery</Text>
          </div>

          <Button appearance="primary" size="large" type="submit" disabled={busy}>
            {busy ? <Spinner size="tiny" /> : "Place COD Order"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
