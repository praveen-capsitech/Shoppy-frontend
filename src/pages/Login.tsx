import {
  Button,
  Card,
  Field,
  Input,
  MessageBar,
  Title1,
} from "@fluentui/react-components";
// import { ProgressIndicator } from '@fluentui/react/lib/ProgressIndicator';
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    try {
      await login(email, password);
        nav("/");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ maxWidth: 420, margin: "40px auto", padding: 28 }}>
      {/* {
        busy && <ProgressIndicator />
      } */}
       
      <Title1>Hi, Welcome Back</Title1>
      <form
        onSubmit={submit}
        style={{ display: "grid", gap: 16, marginTop: 24 }}
      >
        {error && <MessageBar intent="error">{error}</MessageBar>}
        <Field label="Email" required>
          <Input
            type="email"
            value={email}
            onChange={(_, d) => setEmail(d.value)}
          />
        </Field>
        <Field label="Password" required>
          <Input
            type="password"
            value={password}
            onChange={(_, d) => setPassword(d.value)}
          />
        </Field>
        <Button appearance="primary" type="submit" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </Button>
        <span>
          New user? <Link to="/register">Create an account</Link>
        </span>
      </form>
    </Card>
  );
}
