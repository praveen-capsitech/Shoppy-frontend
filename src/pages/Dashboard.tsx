import {
  Badge,
  Button,
  Card,
  MessageBar,
  Spinner,
  Text,
  Title1,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { cartOrderApi, type Cart, type Order } from "../api/cartOrderApi";
import { useAuth } from "../context/AuthContext";
import type { AdminUser, Product } from "../types";

const useStyles = makeStyles({
  page: { display: "grid", gap: tokens.spacingVerticalL },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: tokens.spacingHorizontalM, flexWrap: "wrap" },
  stats: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: tokens.spacingHorizontalM },
  stat: { padding: tokens.spacingVerticalL },
  statValue: { display: "block", marginTop: tokens.spacingVerticalS },
  panels: { display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 1fr)", gap: tokens.spacingHorizontalL },
  panel: { padding: tokens.spacingVerticalL },
  chart: { width: "100%", height: "230px" },
  legend: { display: "flex", gap: tokens.spacingHorizontalL, flexWrap: "wrap", marginTop: tokens.spacingVerticalS },
  actions: { display: "flex", gap: tokens.spacingHorizontalS, flexWrap: "wrap" },
});

type DashboardData = {
  products: Product[];
  orders: Order[];
  cart: Cart | null;
  users: AdminUser[];
};

const statusLabels: Order["status"][] = [
  "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled",
];

function StatCard({ label, value, detail, onClick }: { label: string; value: string | number; detail: string; onClick?: () => void | Promise<void> }) {
  const styles = useStyles();
  return (
    <Card className={styles.stat} onClick={onClick}>
      <Text>{label}</Text>
      <Text size={700} weight="semibold" className={styles.statValue}>{value}</Text>
      <Text size={200}>{detail}</Text>
    </Card>
  );
}

function StatusChart({ orders }: { orders: Order[] }) {
  const styles = useStyles();
  const counts = statusLabels.map((status) => orders.filter((order) => order.status === status).length);
  const max = Math.max(...counts, 1);
  const width = 600;
  const chartHeight = 170;
  const barWidth = 62;
  const gap = 28;

  return (
    <Card className={styles.panel}>
      <Text size={500} weight="semibold">Order status analysis</Text>
      <svg className={styles.chart} viewBox={`0 0 ${width} 230`} role="img" aria-label="Orders by status">
        {counts.map((count, index) => {
          const height = (count / max) * chartHeight;
          const x = 25 + index * (barWidth + gap);
          const y = 185 - height;
          
          return (
            <g key={statusLabels[index]}>
              <rect x={x} y={y} width={barWidth} height={height || 2} rx="5" 
              fill={statusLabels[index] === "Pending" ? "orange" : 
                          statusLabels[index] === "Confirmed" ? "blue" : 
                          statusLabels[index] === "Processing" ? "purple" : 
                          statusLabels[index] === "Shipped" ? "teal" : 
                          statusLabels[index] === "Delivered" ? "green" : 
                          statusLabels[index] === "Cancelled" ? "red" : 
                          "black"
                          } />
              <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="13" fill="#242424">{count}</text>
              <text x={x + barWidth / 2} y="207" textAnchor="middle" fontSize="10"  fill={statusLabels[index] === "Pending" ? "orange" : 
                          statusLabels[index] === "Confirmed" ? "blue" : 
                          statusLabels[index] === "Processing" ? "purple" : 
                          statusLabels[index] === "Shipped" ? "teal" : 
                          statusLabels[index] === "Delivered" ? "green" : 
                          statusLabels[index] === "Cancelled" ? "red" : 
                          "black"
                          }>
                {statusLabels[index]}
              </text>
            </g>
          );
        })}
      </svg>
      <Text size={200}>Current orders grouped by status</Text>
    </Card>
  );
}

export default function Dashboard() {
  const styles = useStyles();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({ products: [], orders: [], cart: null, users: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role === "Admin") {
          const [products, orders, users] = await Promise.all([
            api.get<Product[]>("/products"),
            cartOrderApi.getManageOrders(),
            api.get<AdminUser[]>("/admin/users"),
          ]);
          setData({ products: products.data, orders: orders.data, users: users.data, cart: null });
        } else {
          const [products, orders, cart] = await Promise.all([
            api.get<Product[]>("/products"),
            cartOrderApi.getMyOrders(),
            cartOrderApi.getCart(),
          ]);
          setData({ products: products.data, orders: orders.data, cart: cart.data, users: [] });
        }
      } catch (requestError: any) {
        setError(requestError.response?.statusText ?? "Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user?.role]);

  const totalRevenue = useMemo(
    () => data.orders.reduce((sum, order) => sum + order.totalAmount, 0),
    [data.orders],
  );
  const activeUsers = data.users.filter((item) => item.isActive).length;
  const isAdmin = user?.role === "Admin";
  

  if (loading) return <Spinner label="Loading dashboard..." />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Title1>{isAdmin ? "Admin dashboard" : "Welcome back, " + (user?.name ?? "Customer")}</Title1>
          <Text block>Here is your personalized ShoppyApp summary.</Text>
        </div>
        {/* <div className={styles.actions}>
          <Button onClick={() => navigate(isAdmin ? "/admin" : "/")}>{isAdmin ? "Manage users" : "Shop products"}</Button>
          {!isAdmin && <Button appearance="primary" onClick={() => navigate("/orders")}>View my orders</Button>}
        </div> */}
      </div>

      {error && <MessageBar intent="error">{error}</MessageBar>}

      <div className={styles.stats}>
        <StatCard onClick={() => navigate(isAdmin ? "/manage/products" : "/")} label={isAdmin ? "Total products" : "Products available"} value={data.products.length} detail={`${data.products.filter((item) => item.stock > 0).length} in stock`} />
        <StatCard onClick={() => navigate(isAdmin ? "/manage/orders" : "/my-orders")} label={isAdmin ? "Total orders" : "My orders"} value={data.orders.length} detail={isAdmin ? "All customer orders" : "Orders placed"} />
        <StatCard onClick={()=> navigate(isAdmin ? "/manage/users" : "/")} label={isAdmin ? "Active users" : "Cart items"} value={isAdmin ? activeUsers : (data.cart?.totalItems ?? 0)} detail={isAdmin ? `${data.users.length} registered users` : "Ready for checkout"} />
        <StatCard label={isAdmin ? "Revenue" : "Total spent"} value={`₹${totalRevenue.toFixed(2)}`} detail="Across loaded orders" />
      </div>

      <div className={styles.panels}>
        <StatusChart orders={data.orders} />
        <Card className={styles.panel}>
          <Text size={500} weight="semibold">Quick actions</Text>
          <div className={styles.actions} style={{ marginTop: "16px" }}>
            {isAdmin || user?.role === "Manager" ? (
              <>
                <Button onClick={() => navigate("/manage/orders")}>Manage orders</Button>
                <Button onClick={() => navigate("/manage/products")}>Manage products</Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate("/")} disabled={!data.cart?.totalItems}>View products</Button>
                <Button onClick={() => navigate("/my-orders")}>Order history</Button>
              </>
            )}
          </div>
          {!isAdmin && data.orders[0] && (
            <div style={{ marginTop: "24px" }}>
              <Text block>Latest order</Text>
              <Badge appearance="tint">{data.orders[0].status}</Badge>
              <Text block size={200}>₹{data.orders[0].totalAmount.toFixed(2)}</Text>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
