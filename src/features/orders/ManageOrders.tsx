import {
  Badge,
  Button,
  Card,
  Dropdown,
  MessageBar,
  Option,
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
import { cartOrderApi, Order, OrderStatus } from "../../api/cartOrderApi";

const useStyles = makeStyles({
  page: { padding: tokens.spacingVerticalXXL },
  toolbar: { display: "flex", justifyContent: "space-between", marginBottom: tokens.spacingVerticalL },
  tableCard: { overflowX: "auto" },
});

const statuses: OrderStatus[] = [
  "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled",
];

export function ManageOrders() {
  const styles = useStyles();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setOrders((await cartOrderApi.getManageOrders()).data);
    } catch {
      setError("Unable to load order management.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const update = async (id: string, status: OrderStatus) => {
    setError("");
    try {
      await cartOrderApi.updateOrderStatus(id, status);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Unable to update order status.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Text size={700} weight="semibold">Order Management</Text>
        <Button onClick={() => void load()}>Refresh</Button>
      </div>

      {error && <MessageBar intent="error">{error}</MessageBar>}
      {loading && <Spinner label="Loading orders..." />}

      {!loading && (
        <Card className={styles.tableCard}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Order</TableHeaderCell>
                <TableHeaderCell>Customer</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Items</TableHeaderCell>
                <TableHeaderCell>Total</TableHeaderCell>
                <TableHeaderCell>Payment</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Change status</TableHeaderCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id.slice(-8)}</TableCell>
                  <TableCell>{order.shippingAddress.fullName}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{order.items.reduce((sum, x) => sum + x.quantity, 0)}</TableCell>
                  <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>COD</TableCell>
                  <TableCell><Badge appearance="tint">{order.status}</Badge></TableCell>
                  <TableCell>
                    <Dropdown
                      value={order.status}
                      disabled={order.status === "Delivered" || order.status === "Cancelled"}
                      onOptionSelect={(_, data) => {
                        if (data.optionValue) void update(order.id, data.optionValue as OrderStatus);
                      }}
                    >
                      <Option value={order.status}>{order.status}</Option>
                      {statuses.map((status) => (
                        <Option key={status} value={status}>{status}</Option>
                      ))}
                    </Dropdown>
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
