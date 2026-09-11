import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api/client";
import type { Role, User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: Extract<Role, "Customer" | "Manager">,
  ) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const token = localStorage.getItem("shoppy_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem("shoppy_token"))
      .finally(() => setLoading(false));
  }, []);


  const authenticate = async (endpoint: string, data: object) => {
    const r = await api.post(endpoint, data);
    localStorage.setItem("shoppy_token", r.data.token);
    setUser(r.data.user);
  };


  const login = (email: string, password: string) =>
    authenticate("/auth/login", { email, password });


  const register = async (
    name: string,
    email: string,
    password: string,
    role: Extract<Role, "Customer" | "Manager"> = "Customer",
  ) =>
    api.post("/auth/register", { name, email, password, role }).then((r) => {
      if (r.status === 202) return true;

      localStorage.setItem("shoppy_token", r.data.token);
      setUser(r.data.user);
      return false;
    });


  const logout = () => {
    localStorage.removeItem("shoppy_token");
    setUser(null);
  };


  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
};
