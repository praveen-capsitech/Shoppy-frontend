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
        orders.length === 0 ? (
          <Card>
            <div style={{ padding: 24, textAlign: "center" }}>
              <Text size={500} weight="semibold">No orders for your products yet.</Text>
            </div>
          </Card>
        ) : (
          <Card className={styles.tableCard}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Customer</TableHeaderCell>
                  <TableHeaderCell>Order</TableHeaderCell>
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
                    <TableCell><strong>#{order.id.slice(-8)}</strong></TableCell>
                    <TableCell>{order.shippingAddress.fullName}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{order.items.reduce((sum, x) => sum + x.quantity, 0)}</TableCell>
                    <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>COD</TableCell>
                    <TableCell><Badge appearance="tint"  style={{
                          color: order.status === "Pending" ? "orange" : 
                          order.status === "Confirmed" ? "blue" : 
                          order.status === "Processing" ? "purple" : 
                          order.status === "Shipped" ? "teal" : 
                          order.status === "Delivered" ? "green" : 
                          order.status === "Cancelled" ? "red" : 
                          "black",
                        }}>{order.status}</Badge></TableCell>
                    <TableCell>
                      <Dropdown
                        value={order.status}
                        // style={{
                        //   color: order.status === "Pending" ? "orange" : 
                        //   order.status === "Confirmed" ? "blue" : 
                        //   order.status === "Processing" ? "purple" : 
                        //   order.status === "Shipped" ? "teal" : 
                        //   order.status === "Delivered" ? "green" : 
                        //   order.status === "Cancelled" ? "red" : 
                        //   "black",
                        // }}
                        disabled={order.status === "Delivered" || order.status === "Cancelled"}
                        onOptionSelect={(_, data) => {
                          if (data.optionValue) void update(order.id, data.optionValue as OrderStatus);
                        }}
                      >
                        {/* <Option value={order.status}>{order.status}</Option> */}
                        {statuses.map((status) => (
                          <Option 
                            style={{
                              color: status === "Pending" ? "orange" : 
                              status === "Confirmed" ? "blue" : 
                              status === "Processing" ? "purple" : 
                              status === "Shipped" ? "teal" : 
                              status === "Delivered" ? "green" : 
                              status === "Cancelled" ? "red" : 
                              "black",
                              // color: status === order.status ? "blue":"", 
                              backgroundColor: status === order.status ? "lightgray":"white"
                            }} 
                            key={status} 
                            value={status}>
                              {status}
                          </Option>
                        ))}
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )
      )}
    </div>
  );
}
