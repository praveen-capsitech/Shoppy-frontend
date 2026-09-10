import {
  Button,
  Card,
  Field,
  Input,
  MessageBar,
  Title1,
} from "@fluentui/react-components";
import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const location = useLocation();
  const nav = useNavigate();
  const isManagerRegistration = location.pathname === "/register/manager";
  const role = isManagerRegistration ? "Manager" : "Customer";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    
    try {
      await register(name, email, password, role);
      nav(isManagerRegistration ? "/manage/products" : "/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Registration failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ maxWidth: 420, margin: "40px auto", padding: 28 }}>
      <Title1>
        {isManagerRegistration ? "Create manager account" : "Create customer account"}
      </Title1>
      <form
        onSubmit={submit}
        style={{ display: "grid", gap: 16, marginTop: 24 }}
      >
        {error && <MessageBar intent="error">{error}</MessageBar>}
        <Field label="Name" required>
          <Input value={name} onChange={(_, d) => setName(d.value)} />
        </Field>
        <Field label="Email" required>
          <Input
            type="email"
            value={email}
            onChange={(_, d) => setEmail(d.value)}
          />
        </Field>
        <Field label="Password" hint="Minimum 6 characters" required>
          <Input
            type="password"
            value={password}
            onChange={(_, d) => setPassword(d.value)}
          />
        </Field>
        <Button appearance="primary" type="submit" disabled={busy}>
          {busy ? "Creating..." : `Create ${role.toLowerCase()} account`}
        </Button>
        <span>
          Already registered? <Link to="/login">Sign in</Link>
        </span>
        {isManagerRegistration ? (
          <span>
            Shopping instead? <Link to="/register">Sign up as a customer</Link>
          </span>
        ) : (
          <span>
            Manage products and orders?{" "}
            <Link to="/register/manager">Sign up as a manager</Link>
          </span>
        )}
      </form>
    </Card>
  );
}
