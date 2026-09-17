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
      <Title1>User Management</Title1>
      <div style={{ marginTop: 20, overflowX: "auto" }}>
        <Table
          style={{
            minWidth: 850,
            gridTemplateColumns: "minmax(160px, 1fr) minmax(240px, 1.5fr) 180px 130px 140px",
          }}
        >
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Status Action</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell style={{ width: 50, marginRight: 10, marginLeft: 10 }}>
                  <Dropdown
                    value={u.role}
                    onOptionSelect={(_, d) => role(u.id, d.optionValue as Role)}
                    disabled={u.role === "Admin"}
                  >
                    <Option value="Customer">Customer</Option>
                    <Option value="Manager">Manager</Option>
                    <Option value="Admin">Admin</Option>
                  </Dropdown>
                </TableCell>
                <TableCell style={{ color: u.isActive ? "green" : "red" }}>
                  {u.isActive ? "Active" : "Disabled"}
                </TableCell>
                <TableCell>
                  <Button onClick={() => status(u.id, !u.isActive)} disabled={u.role === "Admin"}>
                    {u.isActive ? "Disable" : "Enable"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
