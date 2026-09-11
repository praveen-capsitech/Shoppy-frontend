import {
  Button,
  Dropdown,
  Option,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Title1,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { AdminUser, Role } from "../types";

export default function Admin() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  const load = () =>
    api.get<AdminUser[]>("/admin/users").then((r) => setUsers(r.data));
  useEffect(() => {
    load();
  }, []);

  const role = async (id: string, r: Role) => {
    await api.put(`/admin/users/${id}/role`, { role: r });
    load();
  };

  const status = async (id: string, v: boolean) => {
    await api.put(`/admin/users/${id}/status`, { isActive: v });
    load();
  };
  
  return (
    <>
      <Title1>Admin dashboard</Title1>
      <Table style={{ marginTop: 20 }}>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Action</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => (
            <TableRow key={u.id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>
                <Dropdown
                  style={{ width: 120 }}
                  value={u.role}
                  onOptionSelect={(_, d) => role(u.id, d.optionValue as Role)}
                  disabled={u.role === "Admin"}
                >
                  <Option value="Customer">Customer</Option>
                  <Option value="Manager">Manager</Option>
                  <Option value="Admin">Admin</Option>
                </Dropdown>
              </TableCell>
              <TableCell>{u.isActive ? "Active" : "Disabled"}</TableCell>
              <TableCell>
                <Button onClick={() => status(u.id, !u.isActive)} disabled={u.role === "Admin"}>
                  {u.isActive ? "Disable" : "Enable"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
