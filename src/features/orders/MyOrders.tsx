import {
  Badge,
  Button,
  Card,
  CardHeader,
  MessageBar,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { cartOrderApi, Order } from "../../api/cartOrderApi";

const useStyles = makeStyles({
  page: { padding: tokens.spacingVerticalXXL },
  header: { marginBottom: tokens.spacingVerticalL },
  status: { textTransform: "capitalize" },
});

const statusColor: Record<Order["status"], "informative" | "warning" | "success" | "danger" | "important"> = {
  Pending: "warning",
  Confirmed: "informative",
  Processing: "important",
  Shipped: "informative",
  Delivered: "success",
  Cancelled: "danger",
};

export function MyOrders() {
  const styles = useStyles();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setOrders((await cartOrderApi.getMyOrders()).data);
    } catch {
      setError("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const cancel = async (id: string) => {
    try {
      await cartOrderApi.cancelMyOrder(id);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Unable to cancel order.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Text size={700} weight="semibold">My Orders</Text>
      </div>

      {error && <MessageBar intent="error">{error}</MessageBar>}
      {loading && <Spinner label="Loading orders..." />}

      {!loading && orders.length === 0 && <Text>No orders yet.</Text>}

      {!loading && orders.length > 0 && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Order</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Total</TableHeaderCell>
                <TableHeaderCell>Payment</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id.slice(-8)}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                  <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>Cash on Delivery</TableCell>
                  <TableCell>
                    <Badge appearance="tint" color={statusColor[order.status]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {(order.status === "Pending" || order.status === "Confirmed") && (
                      <Button size="small" onClick={() => void cancel(order.id)}>Cancel</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
